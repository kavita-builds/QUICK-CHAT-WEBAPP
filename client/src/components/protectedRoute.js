import {useEffect, useState} from "react"
import { Navigate, useNavigate } from "react-router-dom";
import { getLoggedUser,getAllUsers } from "../apiCalls/user";
import { useDispatch, useSelector } from "react-redux";
import { showLoader ,hideLoader} from "../redux/loaderSlice";
import toast from "react-hot-toast"
import { setUser , setAllUser, setAllChats} from "../redux/userSlice";
import { getAllChats } from "../apiCalls/chat";

function ProtectedRoute({children}){
    
    const {user } = useSelector(state=>state.userReducer)
    const dispatch = useDispatch()

    const navigate = useNavigate();

    const getloggedInUser = async ()=>{
        let response = null;
        try{
            dispatch(showLoader())
            response = await getLoggedUser();
            dispatch(hideLoader())

            if(response.success){
                dispatch(setUser(response.data))
            }else{
                toast.error(response.message)
                window.location.href = '/login'
            }

        }catch{
            dispatch(hideLoader());
            navigate('/login')
        }
    }


const getAllUsersfromDb = async () =>{
    let response = null;
     try{
            dispatch(showLoader())
            response = await getAllUsers();
            dispatch(hideLoader())

            if(response.success){
                dispatch(setAllUser(response.data))
            }else{
                toast.error(response.message)
                window.location.href = '/login'
            }


    }catch(error){
        dispatch(hideLoader());
        navigate('/login')
    }
}



const getCurrentUserChats = async()=>{

    try{
        const response = await getAllChats()
        if(response.success){
            dispatch(setAllChats(response.data))
        }

    }catch(error){
        navigate('/login')
    }
}

    useEffect(()=>{
        if(localStorage.getItem('token')){
            getloggedInUser()
            getAllUsersfromDb()
            getCurrentUserChats()
            
        }else{
            navigate('/login')
        }
    },[])

     
    return(
         <div>
            
        {children}
    </div>
    )
}

export default ProtectedRoute;
