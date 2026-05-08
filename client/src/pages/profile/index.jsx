import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { uploadProfilePic } from "../../api/user";
import { toast } from "react-hot-toast";
import { showLoader, hideLoader } from "../../redux/loaderSlice";
import { setUser } from "../../redux/userSlice";

function Profile() {
  const { user } = useSelector((state) => state.userReducer);
  const [image, setImage] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.profilePic) {
      setImage(user.profilePic);
    }
  }, [user]);

  function getInitials(user) {
    let fname = user?.firstname.toUpperCase()[0];
    let lname = user?.lastname.toUpperCase()[0];
    return `${fname}${lname}`;
  }

  function getFullName(user) {
    let fname =
      user?.firstname[0].toUpperCase() + user?.firstname.slice(1).toLowerCase();
    let lname =
      user?.lastname[0].toUpperCase() + user?.lastname.slice(1).toLowerCase();
    return `${fname} ${lname}`;
  }

  async function onFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function uploadImage() {
    try {
      dispatch(showLoader());
      const response = await uploadProfilePic(image);
      if (response.success) {
        toast.success("Profile picture updated successfully");
        dispatch(setUser(response.data));
      }
    } catch (error) {
      toast.error("Error uploading profile picture");
    } finally {
      dispatch(hideLoader());
    }
  }
  return (
    <div className="profile-page-container">
      <div className="profile-pic-container">
        {image && (
          <img
            src={image}
            alt="Profile Pic"
            className="user-profile-pic-upload"
          />
        )}
        {!image && (
          <div className="user-default-profile-avatar">{getInitials(user)}</div>
        )}
      </div>

      <div className="profile-info-container">
        <div className="user-profile-name">
          <h1>{getFullName(user)}</h1>
        </div>
        <div>
          <b>Email: </b>
          {user?.email}
        </div>
        <div>
          <b>Account Created: </b>
          {moment(user?.createdAt).format("MMM DD, YYYY")}
        </div>
        <div className="select-profile-pic-container">
          <input type="file" onChange={onFileSelect} />
          <button className="upload-profile-pic" onClick={uploadImage}>Upload</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
