import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function Header({socket}) {
  const { user } = useSelector((state) => state.userReducer);
  const navigate = useNavigate();

  function getFullName(user) {
    let fname = user?.firstname[0].toUpperCase() + user?.firstname.slice(1).toLowerCase();
    let lname = user?.lastname[0].toUpperCase() + user?.lastname.slice(1).toLowerCase();
    return `${fname} ${lname}`;
  } 

  function getInitials(user) {
    let fname = user?.firstname.toUpperCase()[0];
    let lname = user?.lastname.toUpperCase()[0];
    return `${fname}${lname}`;
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
    socket.emit("user-offline", user?._id);
  }
  
  return (
    <div className="app-header">
      <div className="app-logo">
        <i className="fa fa-comments" aria-hidden="true"></i>
        Blink Chat
      </div>
      <div className="app-user-profile">
        <div className="logged-user-name">{user ? getFullName(user) : "Guest"}</div>
        {user?.profilePic ? (
          <img
            src={user.profilePic}
            alt="Profile"
            className="logged-user-profile-pic"
            onClick={() => navigate("/profile")}
          />
        ) : (
          <div className="logged-user-profile-pic" onClick={() => navigate("/profile")}>
            {user ? getInitials(user) : "G"}
          </div>
        )}
        <button className='logout-btn' onClick={logout}>
          <i className="fa fa-sign-out" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}

export default Header