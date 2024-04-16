
import axios from "axios"
// import { Vidsrc } from "../interfaces/mvtv"
// import { mydb } from "../dbs/lmdb"
// import { putData,getData } from "../dbs/lmdb"
// import { Tv } from "../routes/tv"
// import { Movie } from "../routes/movie"
import { Vidsrc } from "./interfaces/vidsrc-to"
import { client } from "./midlewares/uptashRedis"

const toUrl = 'https://vidsrc-bc567b0e907e.herokuapp.com/'
const meUrl = 'https://moviekexonline-29aedc6d6588.herokuapp.com/'
const nodeProxy = 'https://nodeproxy-1a962f2c7198.herokuapp.com/'
// const nodeProxy = 'https://first-app.vidsrcproxy.workers.dev/'
const vidsrcmeProxy = 'https://proxy-vidsrc-me-0e71f022c893.herokuapp.com/fetch?url='
// const vidsrc_working:boolean = true

async function fetchinVidsrc(id:string,ss:string|null = null ,ep:string|null = null) {
  console.log('sir got fetch order ')
  try {
    if(ss==null){
      const res = await axios.get(toUrl+'movie/'+id)
      const data:Vidsrc = res.data
      if (data.m3u8[0] !=null){
let m3u8:string = data.m3u8[0]
let modifiedM3u8:string=nodeProxy+encodeURIComponent(m3u8)
data.m3u8[0]=modifiedM3u8
        return data
      }
      else{
        const meRes:Vidsrc = await axios.get(meUrl+'movie/'+id)
        return meRes
      }
    }

    if(ss!=null){
      const res = await axios.get(toUrl+'tv/'+id+'/'+ss+'/'+ep)
      const data:Vidsrc = res.data
      if (data.m3u8[0] !=null){
        let m3u8:string = data.m3u8[0]
        let modifiedM3u8:string=nodeProxy+encodeURIComponent(m3u8)
        data.m3u8[0]=modifiedM3u8
        return data
      }
      else{
        const meRes:Vidsrc = await axios.get(meUrl+'tv/'+id+'/'+ss+'/'+ep)
        return meRes
      }
    }
  } catch (error) {
    console.error(`err in fetch data from vidsrc.to : ${error} | now will retry to vidsrc.me`)
    
//     if(ss==null){
//       // const meRes:Vidsrc = await axios.get(meUrl+'movie/'+id)
//       // return meRes
//       const x:Vidsrc =await Movie(id)
//       x.m3u8[0] = vidsrcmeProxy + encodeURIComponent(x.m3u8[0])
//       return x
//     }else{
//       const x:Vidsrc =await Tv(id,ss,ep)
//       x.m3u8[0] = vidsrcmeProxy + encodeURIComponent(x.m3u8[0])
//       return x
      
//     }
  }

}

function Key(id:string,ss:string|null = null,ep:string|null = null){
  const key = ss!=null ? `${id}/${ss}/${ep}`:id
  return key
}


async function dms(key:string,obj:Vidsrc|null = null){
  if(obj != null){
    await client.set(key,JSON.stringify(obj)) 
  }
  let data:null|string = await client.get(key)
  let data2:null|Vidsrc = data!=null ? JSON.parse(data) :data
  
  return data2
}



async function  dataProcessing(id:string,ss:string|null = null,ep:string|null = null){
  const key =  Key(id,ss,ep)
  const getDms:Vidsrc|null = await dms(key)
  // console.log(getDms)

  if (getDms!=null ){
    try {
      let testM3u8:string = await axios.get(getDms.m3u8[0])
      console.log('seems m3u8 link is okey returning test ')
      return getDms
    } catch (error) {
      console.log('looks like m3u8 link got expired re fetcing it ')
      let response = await fetchinVidsrc(id,ss,ep)
      await dms(key,response)
      return  response
    
    }
 

  }
  else if(getDms==undefined){
    console.log(key + ' is undifend so i have to fetch again db ')
    const fetchedVidsrc = await fetchinVidsrc(id,ss,ep)
    // console.log(fetchedVidsrc)
     dms(key,fetchedVidsrc)
     return fetchedVidsrc
  }
   
  
  // const response = await fetchinVidsrc(id,ss,ep)

}


export async function vidsrc(id:string,ss:string|null = null,ep:string|null = null){

  const data = await dataProcessing(id,ss,ep)
 

  // console.log(data)
  console.log(data)
  return data
}


console.log(vidsrc('1399','1','1'))

