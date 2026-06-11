require('dotenv').config();
const mongoose = require('mongoose');
const {Readable} = require('stream');
const Resource = require('../models/Resource');
const { cloudinary } = require('../config/cloudinary');

async function headStatus(url, headers={}){
  try{
    const res = await fetch(url, { method: 'HEAD', headers, redirect: 'follow' });
    return res.status;
  }catch(e){ return null; }
}

async function tryFetch(url, headers={}){
  try{
    const res = await fetch(url, { method: 'GET', headers, redirect: 'follow' });
    return res;
  }catch(e){ return null; }
}

function uploadStreamPromise(opts){
  return new Promise((resolve, reject)=>{
    const cb = (err, result)=> err? reject(err): resolve(result);
    const uploadStream = cloudinary.uploader.upload_stream(opts, cb);
    resolve.uploadStream = uploadStream;
  });
}

async function reprocessResource(r){
  console.log('Processing', r._id.toString(), r.fileName, r.cloudinaryPublicId);
  const publicId = r.cloudinaryPublicId;
  const currentUrl = r.fileUrl;

  // quick check
  const status = await headStatus(currentUrl);
  if(status===200){ console.log('Already accessible (200)'); return {ok:true, reason:'already'}; }

  // try to get Cloudinary secure url via API metadata
  let meta = null;
  try{ meta = await cloudinary.api.resource(publicId, { resource_type: r.resourceType || 'image' }); }catch(e){ console.log('cloudinary.api.resource err', e.message || e); }
  const secureUrl = meta && meta.secure_url ? meta.secure_url : currentUrl;

  // attempt to GET secureUrl with Basic auth (api_key:api_secret) if possible
  const cfg = cloudinary.config();
  const basicAuth = cfg.api_key && cfg.api_secret ? 'Basic ' + Buffer.from(cfg.api_key+':'+cfg.api_secret).toString('base64') : null;
  let res = await tryFetch(secureUrl, basicAuth ? { Authorization: basicAuth } : {});
  if(res && res.status===200){
    console.log('Fetched upstream successfully, streaming to new upload...');
    try{
      const nodeStream = Readable.fromWeb(res.body);
      const upPromise = uploadStreamPromise({ resource_type: 'raw' });
      nodeStream.pipe(upPromise.resolve?.uploadStream || upPromise.uploadStream);
      // the promise returned earlier resolves when assigned; wait for its resolution via a new Promise
      const final = await new Promise((resolve, reject)=>{
        // replace callback wiring
        const cb = (err, result)=> err? reject(err): resolve(result);
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'raw' }, cb);
        nodeStream.pipe(uploadStream);
      });
      console.log('Re-uploaded as', final.public_id);
      r.cloudinaryPublicId = final.public_id;
      r.fileUrl = final.secure_url || final.url;
      r.resourceType = 'raw';
      await r.save();
      return {ok:true, reason:'reuploaded', newPublicId: final.public_id};
    }catch(e){ console.log('upload stream err', e && (e.http_code||e.message) || e); }
  }else{
    console.log('Could not fetch secureUrl (status', res && res.status, '). Trying direct uploader.upload and explicit operations');
    // 1) try uploader.upload directly
    try{
      const up = await cloudinary.uploader.upload(secureUrl, { resource_type: 'raw' });
      console.log('Uploader.upload success', up.public_id);
      r.cloudinaryPublicId = up.public_id;
      r.fileUrl = up.secure_url || up.url;
      r.resourceType = 'raw';
      await r.save();
      return {ok:true, reason:'uploaded_direct', newPublicId: up.public_id};
    }catch(e){ console.log('uploader.upload err', e && (e.http_code||e.message) || e); }

    // 2) try explicit to copy/retype the resource (try converting to raw, then to upload)
    try{
      const explicitRaw = await cloudinary.uploader.explicit(publicId, { resource_type: 'raw', type: 'upload' });
      console.log('explicit -> raw success', explicitRaw.public_id);
      r.cloudinaryPublicId = explicitRaw.public_id;
      r.fileUrl = explicitRaw.secure_url || explicitRaw.url;
      r.resourceType = 'raw';
      await r.save();
      return {ok:true, reason:'explicit_raw', newPublicId: explicitRaw.public_id};
    }catch(e){ console.log('explicit raw err', e && (e.http_code||e.message) || e); }

    try{
      const explicitAuth = await cloudinary.uploader.explicit(publicId, { resource_type: r.resourceType || 'image', type: 'authenticated' });
      console.log('explicit -> authenticated success', explicitAuth.public_id);
      // generate private download URL
      try{
        const priv = cloudinary.utils.private_download_url(explicitAuth.public_id, { resource_type: explicitAuth.resource_type });
        console.log('private_download_url', priv);
      }catch(e){ console.log('private_download_url err', e && (e.http_code||e.message) || e); }
      return {ok:true, reason:'explicit_authenticated', newPublicId: explicitAuth.public_id};
    }catch(e){ console.log('explicit authenticated err', e && (e.http_code||e.message) || e); }
  }

  // last resort: try create_archive
  try{
    const arch = await cloudinary.uploader.create_archive({ public_ids: [publicId], resource_type: r.resourceType || 'image' });
    console.log('create_archive returned', arch && (arch.url||arch.secure_url));
    if(arch && (arch.url||arch.secure_url)){
      const aurl = arch.secure_url || arch.url;
      const ares = await tryFetch(aurl);
      if(ares && ares.status===200){
        console.log('Archive reachable');
        return {ok:true, reason:'archive', url: aurl};
      }
    }
  }catch(e){ console.log('create_archive err', e.message || e); }

  return {ok:false, reason:'all_failed'};
}

(async ()=>{
  try{
    await mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true, useUnifiedTopology:true});
    const candidates = await Resource.find({}).limit(20).sort({createdAt:-1});
    for(const r of candidates){
      try{
        const result = await reprocessResource(r);
        console.log('Result for', r._id.toString(), result);
      }catch(e){ console.error('resource loop err', e); }
    }
  }catch(e){ console.error('fatal err', e); }
  finally{ await mongoose.disconnect(); process.exit(0); }
})();
