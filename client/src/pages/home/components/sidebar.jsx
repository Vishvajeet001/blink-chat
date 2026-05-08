import Search from './search'
import { useState } from 'react'
import UserList from './userList'

function Sidebar({ socket, onlineUsers }) {
  const [searchTerm, setSearchTerm] = useState('');
  return (
    <div className="app-sidebar">
      <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <UserList searchTerm={searchTerm} socket={socket} onlineUsers={onlineUsers} />
    </div>
  );
}

export default Sidebar