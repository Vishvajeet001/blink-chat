function Search({ searchTerm, setSearchTerm }) {
  return (
    <div className="user-search-area">
      <input 
        type="text" 
        className="user-search-text" 
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <i className="fa fa-search user-search-btn" aria-hidden="true"></i>
    </div>
  );
}

export default Search