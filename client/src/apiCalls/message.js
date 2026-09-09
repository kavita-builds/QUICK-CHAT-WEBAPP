import { axiosInstance ,url} from ".";





export const  createNewMessage = async(message)=>{
    try{
        const response = await axiosInstance.post(url + 'api/message/new-message' , message)
        return response.data;

    }catch(error){
        return error;
    }
}






export const  getAllMessages = async(chatId)=>{
    try{
        const response = await axiosInstance.get(url+`/api/message/get-all-message/${chatId}`)
        return response.data;

    }catch(error){
        return error;
    }
}