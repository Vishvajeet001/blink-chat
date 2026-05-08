import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getLoggedInUser, getAllUsers } from '../api/user';
import { getAllChats } from '../api/chat';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setAllUsers, setUser, setAllChats } from '../redux/userSlice';

function ProtectedRoute({ children }) {
    const { user } = useSelector((state) => state.userReducer);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const getuserinfo = async () => {

        let response = null;

        try {

            response = await getLoggedInUser();

            if (!response.success) {

                navigate("/login");

            } else {
                dispatch(setUser(response.data));

            }
        } catch (error) {

            navigate("/login");
            
        }
    };

    const getAllTheUsers = async () => {
      let response = null;

      try {
        response = await getAllUsers();

        if (!response.success) {
          navigate("/login");
        } else {
          dispatch(setAllUsers(response.data));
        }
      } catch (error) {
        navigate("/login");
      }
    };

    const getCurrentUserChats = async () => {
      let response = null;

      try {
        response = await getAllChats();

        if (!response.success) {
          navigate("/login");
        } else {
          dispatch(setAllChats(response.data));
        }
      } catch (error) {
        navigate("/login");
      }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }else {
            getuserinfo();
            getAllTheUsers();
            getCurrentUserChats();
        }
    }, [])

  return (
    <>
      <div>{children}</div>
    </>
  );
}

export default ProtectedRoute