import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { Search } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function ContactList() {
  const { getAllContacts, allContacts:user, setSelectedUser, isUsersLoading } = useChatStore();
  const [username, setUsername] = useState("");
   const { onlineUsers } = useAuthStore();

  const handleSearchUser = async () => {
    if (username.trim().length === 0) return;
    getAllContacts({ username });
  };

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <div className="p-4 space-y-4">
      
      {/* Search Input */}
      <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
        <p 
          className="text-gray-300 cursor-pointer hover:text-white transition"
         
        >@</p>
        <input
          type="text"
          placeholder="Search username..."
          className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Search 
          className="text-gray-300 cursor-pointer hover:text-white transition"
          onClick={handleSearchUser}
        />
      </div>

      {/* Contact List */}
      <div className="space-y-3">
        {user  ?  (
         
            <div
              key={user._id}
              className="bg-gray-800/40 p-3 rounded-lg cursor-pointer hover:bg-gray-700/60 transition"
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center gap-3">
                <div className={`avatar ${onlineUsers.includes(user._id) ? "online" : "offline"}`}>
                  <div className="size-12 rounded-full overflow-hidden">
                    <img src={user.profilePic || "/avatar.png"} alt="profile" />
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium">{user.fullName}</h4>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                </div>
              </div>
            </div>
          
        ) : (
          <p className="text-gray-400 text-center">No users found.</p>
        )}
      </div>
    </div>
  );
}

export default ContactList;
