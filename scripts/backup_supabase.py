"""Back up two Supabase databases and Storage objects to private Google Drive folders.
Requires GitHub Actions secrets; does not persist data in the repository or Actions artifacts.
"""
import io, json, os, pathlib, subprocess, tempfile, datetime
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

def required(key):
    val = os.getenv(key, "")
    if not val: raise RuntimeError("Missing secret/configuration: " + key)
    return val

def upload(drive, path, folder, name):
    media = MediaFileUpload(str(path), mimetype="application/octet-stream", resumable=True)
    return drive.files().create(body={"name": name, "parents": [folder]}, media_body=media, fields="id,name,size", supportsAllDrives=True).execute()

def backup_storage(base, key, root, drive, folder, prefix):
    headers={"apikey":key,"Authorization":"Bearer "+key}
    r=requests.get(base+"/storage/v1/bucket",headers=headers,timeout=30)
    r.raise_for_status()
    manifest=[]
    def walk(bucket, path=""):
        r=requests.post(base+"/storage/v1/object/list/"+bucket,headers=headers,json={"prefix":path,"limit":1000,"offset":0},timeout=60)
        r.raise_for_status()
        items=r.json()
        if len(items)==1000:
            raise RuntimeError("Storage listing hit 1000-item limit; refusing incomplete backup: "+bucket+"/"+path)
        for item in items:
            name=item["name"]
            full=(path+"/"+name).strip("/")
            if item.get("id") is None:
                walk(bucket,full)
            else:
                u=base+"/storage/v1/object/"+bucket+"/"+"/".join(requests.utils.quote(x,safe="") for x in full.split("/"))
                resp=requests.get(u,headers=headers,timeout=120)
                resp.raise_for_status()
                local=root/("object_"+str(len(manifest)))
                local.write_bytes(resp.content)
                result=upload(drive,local,folder,prefix+"_storage_"+str(len(manifest)))
                manifest.append({"bucket":bucket,"path":full,"drive_file_id":result["id"],"bytes":len(resp.content)})
                local.unlink()
    for bucket in r.json(): walk(bucket["id"])
    return manifest

def main():
    creds=service_account.Credentials.from_service_account_info(json.loads(required("GOOGLE_SERVICE_ACCOUNT_JSON")),scopes=["https://www.googleapis.com/auth/drive.file"])
    drive=build("drive","v3",credentials=creds,cache_discovery=False)
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    with tempfile.TemporaryDirectory() as td:
        root=pathlib.Path(td)
        for prefix,tag in [("sales","SALES"),("mitsumori","MITSUMORI")]:
            folder=required(tag+"_DRIVE_FOLDER")
            db=required(tag+"_DB_URL")
            dump=root/(prefix+"_"+stamp+".dump")
            subprocess.run(["pg_dump","--format=custom","--no-owner","--no-acl","--file",str(dump),db],check=True,timeout=1200)
            if dump.stat().st_size==0: raise RuntimeError("Empty dump: "+prefix)
            dbfile=upload(drive,dump,folder,dump.name)
            manifest={"timestamp_utc":stamp,"project":prefix,"database":{"drive_file_id":dbfile["id"],"bytes":dump.stat().st_size},"storage":[]}
            manifest["storage"]=backup_storage(required(tag+"_SUPABASE_URL"),required(tag+"_SERVICE_ROLE_KEY"),root,drive,folder,prefix+"_"+stamp)
            mf=root/(prefix+"_"+stamp+"_manifest.json")
            mf.write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
            upload(drive,mf,folder,mf.name)
            print(prefix+": uploaded database, "+str(len(manifest["storage"]))+" Storage objects and manifest")
if __name__=="__main__": main()
