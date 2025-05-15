import React, { useState, useEffect } from 'react';
import './Admin.css';
import { API_URL } from '../config';

function Admin() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [page, setPage] = useState(token ? 'dashboard' : 'login');
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploadKeys, setUploadKeys] = useState([]);
  // Timer state for key expiry countdown
  const [now, setNow] = useState(Date.now());
  // State for custom delete confirmation, notifications, and tracking new key
  const [pendingDeleteKey, setPendingDeleteKey] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [newKey, setNewKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  // Manage Users state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoleUser, setNewRoleUser] = useState('user');
  const [userPendingDelete, setUserPendingDelete] = useState(null);
  const [userDeleteMessage, setUserDeleteMessage] = useState('');
  const [userAddMessage, setUserAddMessage] = useState('');
  // Editing user state
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUsername, setEditingUsername] = useState('');
  const [editingRole, setEditingRole] = useState('');
  const [userEditMessage, setUserEditMessage] = useState('');
  // Add state for new password when editing a user
  const [editingPassword, setEditingPassword] = useState('');
  // Password reset enforcement message
  const [userResetMessage, setUserResetMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [resetRequired, setResetRequired] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  // File management state
  const [filePendingDelete, setFilePendingDelete] = useState(null);
  const [fileDeleteMessage, setFileDeleteMessage] = useState('');
  const [editingFileId, setEditingFileId] = useState(null);
  const [editingFileName, setEditingFileName] = useState('');
  const [fileEditMessage, setFileEditMessage] = useState('');
  const [openActions, setOpenActions] = useState(null);

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setUsername(data.username);
        setUserId(data.id);
        setRole(data.role);
        localStorage.setItem('role', data.role);
        if (data.forcePasswordReset) {
          setResetRequired(true);
          setPage('reset');
        } else {
          setPage('dashboard');
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Login error');
    }
  };

  // Add new user
  const handleAddUser = async () => {
    if (!newUsername || !newPassword) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRoleUser }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserAddMessage('User created successfully');
        fetchUsers();
        setNewUsername('');
        setNewPassword('');
        setNewRoleUser('user');
      } else {
        setUserAddMessage(`Error: ${data.message}`);
      }
    } catch {
      setUserAddMessage('Error creating user');
    }
    setTimeout(() => setUserAddMessage(''), 3000);
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setUsers(data);
  };

  // Initiate user delete confirmation
  const handleDeleteUser = (userId) => {
    setUserPendingDelete(userId);
  };
  // Confirm user deletion
  const confirmDeleteUser = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUserDeleteMessage('User deleted successfully');
        fetchUsers();
      } else {
        setUserDeleteMessage(`Error: ${data.message}`);
      }
    } catch {
      setUserDeleteMessage('Error deleting user');
    }
    setUserPendingDelete(null);
    setTimeout(() => setUserDeleteMessage(''), 3000);
  };

  const fetchFiles = async () => {
    const res = await fetch(`${API_URL}/api/admin/files`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setFiles(data);
  };

  const fetchUploadKeys = async () => {
    const res = await fetch(`${API_URL}/api/admin/upload-keys`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setUploadKeys(data);
    } else {
      alert(data.message);
    }
  };

  const generateKey = async () => {
    const res = await fetch(`${API_URL}/api/admin/upload-key`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setNewKey(data.key);
      fetchUploadKeys();
      setPage('keys');
      // Clear newKey badge after 3 seconds
      setTimeout(() => setNewKey(null), 3000);
    }
  };

  // Initiate delete, show inline confirm buttons
  const handleDeleteKey = (keyToDelete) => {
    setPendingDeleteKey(keyToDelete);
  };
  // Confirm deletion and show inline notification
  const confirmDelete = async (keyToDelete) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/upload-keys/${keyToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteMessage('Upload key deleted.');
        fetchUploadKeys();
      } else {
        setDeleteMessage(`Error: ${data.message}`);
      }
    } catch {
      setDeleteMessage('Error deleting key.');
    }
    setPendingDeleteKey(null);
    setTimeout(() => setDeleteMessage(''), 3000);
  };

  // Copy key from the table and show inline badge
  const handleCopyFromList = (keyToCopy) => {
    if (navigator.clipboard && window.isSecureContext) {
      // Use clipboard API if available
      navigator.clipboard.writeText(keyToCopy)
        .then(() => {
          setCopiedKey(keyToCopy);
          setTimeout(() => setCopiedKey(null), 2000);
        })
        .catch(() => {
          // Fallback to manual copy if clipboard API fails
          fallbackCopy(keyToCopy);
        });
    } else {
      // Fallback for non-secure contexts or when clipboard API is not available
      fallbackCopy(keyToCopy);
    }
  };

  // Fallback copy method
  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    
    document.body.removeChild(textArea);
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setToken('');
    setUsername('');
    setRole('');
    setPage('login');
  };

  // Initiate user edit
  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setEditingUsername(user.username);
    setEditingRole(user.role);
    setEditingPassword(''); // reset password field for editing
    setUserEditMessage('');
  };
  // Cancel edit
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setUserEditMessage('');
    setEditingPassword(''); // clear password field
  };
  // Save edited user
  const handleSaveUser = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: editingUsername, role: editingRole, password: editingPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserEditMessage('User updated successfully');
        setUsers(users.map(u => u.id === userId ? { ...u, username: editingUsername, role: editingRole } : u));
        setEditingUserId(null);
      } else {
        setUserEditMessage(`Error: ${data.message}`);
      }
    } catch {
      setUserEditMessage('Error updating user');
    }
    setTimeout(() => setUserEditMessage(''), 3000);
  };

  // Toggle force password reset flag for user
  const handleToggleReset = async (userId, currentFlag) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ forcePasswordReset: !currentFlag }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, forcePasswordReset: !currentFlag } : u));
        setUserResetMessage(!currentFlag ? 'Password reset required for user.' : 'Password reset requirement cleared.');
      } else {
        setUserResetMessage(`Error: ${data.message}`);
      }
    } catch {
      setUserResetMessage('Error updating reset flag');
    }
    setTimeout(() => setUserResetMessage(''), 3000);
  };

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetPassword) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: resetPassword, forcePasswordReset: false }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetMessage('Password updated successfully');
        setTimeout(() => setResetMessage(''), 3000);
        setResetRequired(false);
        setPage('dashboard');
      } else {
        setResetMessage(`Error: ${data.message}`);
        setTimeout(() => setResetMessage(''), 3000);
      }
    } catch (err) {
      setResetMessage('Error updating password');
      setTimeout(() => setResetMessage(''), 3000);
    }
  };

  // Delete file handlers
  const handleDeleteFile = (fileId) => {
    setOpenActions(null);
    setFilePendingDelete(fileId);
  };
  const confirmDeleteFile = async (fileId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOpenActions(null);
        setFileDeleteMessage('File deleted successfully');
        fetchFiles();
      } else {
        setFileDeleteMessage(`Error: ${data.message}`);
      }
    } catch {
      setFileDeleteMessage('Error deleting file');
    }
    setFilePendingDelete(null);
    setTimeout(() => setFileDeleteMessage(''), 3000);
  };

  // Edit file metadata handlers
  const handleEditFile = (file) => {
    setEditingFileId(file.id);
    setEditingFileName(file.originalName);
    setFileEditMessage('');
    setOpenActions(null);
  };
  const handleCancelFileEdit = () => {
    setEditingFileId(null);
    setFileEditMessage('');
  };
  const handleSaveFile = async (fileId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/files/${fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ originalName: editingFileName }),
      });
      const data = await res.json();
      if (res.ok) {
        setOpenActions(null);
        setFileEditMessage('File updated successfully');
        setFiles(files.map(f => f.id === fileId ? { ...f, originalName: editingFileName } : f));
        setEditingFileId(null);
      } else {
        setFileEditMessage(`Error: ${data.message}`);
      }
    } catch {
      setFileEditMessage('Error updating file');
    }
    setTimeout(() => setFileEditMessage(''), 3000);
  };

  // Download file using original name from server blob
  const handleDownloadFile = async (file) => {
    try {
      const response = await fetch(`${API_URL}/uploads/${file.storageName}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error', err);
    }
    setOpenActions(null);
  };

  // Add this helper function near the top of the component
  const isPreviewableFile = (mimeType) => {
    const previewableTypes = [
      'image/',
      'video/',
      'application/pdf'
    ];
    return previewableTypes.some(type => mimeType.startsWith(type));
  };

  // Update the preview handler
  const handlePreviewFile = (file) => {
    const url = `${API_URL}/uploads/${file.storageName}`;
    if (file.mimeType.startsWith('video/')) {
      // For videos, open in a new tab with video player
      window.open(url, '_blank');
    } else {
      // For images and PDFs, open directly
      window.open(url, '_blank');
    }
    setOpenActions(null);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (page === 'users') {
      fetchUsers();
    } else if (page === 'files') {
      fetchFiles();
    } else if (page === 'keys') {
      fetchUploadKeys();
    }
  }, [page]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (page === 'login') {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <h2>Admin Login</h2>
          <form onSubmit={login}>
            <input
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  if (page === 'reset') {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <h2>Reset Password</h2>
          <form onSubmit={handlePasswordReset}>
            <input
              type="password"
              placeholder="New Password"
              value={resetPassword}
              onChange={e => setResetPassword(e.target.value)}
            />
            <button type="submit">Update Password</button>
          </form>
          {resetMessage && <p className="user-reset-message">{resetMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h2>Welcome, {username}</h2>
        <div className="admin-actions">
          {role === 'admin' && (
            <button onClick={() => setPage('users')}>Manage Users</button>
          )}
          {['admin', 'moderator'].includes(role) && (
            <button onClick={() => setPage('files')}>Manage Files</button>
          )}
          <button onClick={() => setPage('keys')}>Manage Keys</button>
          <button onClick={generateKey}>Generate Upload Key</button>
          <button onClick={logout}>Logout</button>
        </div>
        {page === 'users' && (
          <div className="admin-list">
            <h3>Users</h3>
            <div className="user-form">
              <input
                placeholder="Username"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <select
                value={newRoleUser}
                onChange={e => setNewRoleUser(e.target.value)}
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
              <button type="button" onClick={handleAddUser}>Add User</button>
            </div>
            {userAddMessage && <p className="user-add-message">{userAddMessage}</p>}
            {userDeleteMessage && <p className="user-delete-message">{userDeleteMessage}</p>}
            {userEditMessage && <p className="user-edit-message">{userEditMessage}</p>}
            {userResetMessage && <p className="user-reset-message">{userResetMessage}</p>}
            {users.length === 0 ? (
              <p className="no-users">No users found.</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Reset PW</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        {editingUserId === u.id ? (
                          <input
                            className="user-edit-input"
                            value={editingUsername}
                            onChange={e => setEditingUsername(e.target.value)}
                          />
                        ) : (
                          u.username
                        )}
                      </td>
                      <td>
                        {editingUserId === u.id ? (
                          <select
                            className="user-edit-select"
                            value={editingRole}
                            onChange={e => setEditingRole(e.target.value)}
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          u.role
                        )}
                      </td>
                      <td>
                        {editingUserId === u.id ? (
                          <input
                            type="password"
                            className="user-edit-input"
                            placeholder="New Password"
                            value={editingPassword}
                            onChange={e => setEditingPassword(e.target.value)}
                          />
                        ) : u.forcePasswordReset ? (
                          <span className="reset-pending">Pending</span>
                        ) : (
                          <button className="reset-button" onClick={() => handleToggleReset(u.id, u.forcePasswordReset)}>Require</button>
                        )}
                      </td>
                      <td>
                        {editingUserId === u.id ? (
                          <>
                            <button className="confirm-button" onClick={() => handleSaveUser(u.id)}>Save</button>
                            <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
                          </>
                        ) : userPendingDelete === u.id ? (
                          <>
                            <button className="confirm-button" onClick={() => confirmDeleteUser(u.id)}>Yes</button>
                            <button className="cancel-button" onClick={() => setUserPendingDelete(null)}>No</button>
                          </>
                        ) : (
                          <>
                            <button className="edit-button" onClick={() => handleEditUser(u)}>Edit</button>
                            <button className="delete-button" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {page === 'files' && (
          <div className="admin-list files-table-container">
            <h3>Files</h3>
            {fileDeleteMessage && <p className="file-delete-message">{fileDeleteMessage}</p>}
            {fileEditMessage && <p className="file-edit-message">{fileEditMessage}</p>}
            {files.length === 0 ? (
              <p className="no-files">No files uploaded.</p>
            ) : (
              <table className="files-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Type</th>
                    <th>Uploaded At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(f => (
                    <tr key={f.id}>
                      <td className="file-name-cell" title={f.originalName}>
                        {editingFileId === f.id ? (
                          <input
                            className="file-edit-input"
                            value={editingFileName}
                            onChange={e => setEditingFileName(e.target.value)}
                          />
                        ) : (
                          f.originalName
                        )}
                      </td>
                      <td>{(f.size / 1024).toFixed(2)} KB</td>
                      <td>{f.mimeType}</td>
                      <td>{new Date(f.uploadedAt).toLocaleString()}</td>
                      <td className="actions-cell">
                        {editingFileId === f.id ? (
                          <>
                            <button className="confirm-button" onClick={() => handleSaveFile(f.id)}>Save</button>
                            <button className="cancel-button" onClick={handleCancelFileEdit}>Cancel</button>
                          </>
                        ) : filePendingDelete === f.id ? (
                          <>
                            <button className="confirm-button" onClick={() => confirmDeleteFile(f.id)}>Yes</button>
                            <button className="cancel-button" onClick={() => setFilePendingDelete(null)}>No</button>
                          </>
                        ) : (
                          <div className="dropdown">
                            <button
                              className="dropdown-toggle"
                              onClick={() => setOpenActions(openActions === f.id ? null : f.id)}
                            >
                              Actions
                            </button>
                            {openActions === f.id && (
                              <ul className="dropdown-menu">
                                {isPreviewableFile(f.mimeType) && (
                                  <li className="dropdown-item" onClick={() => handlePreviewFile(f)}>Preview</li>
                                )}
                                <li className="dropdown-item" onClick={() => handleDownloadFile(f)}>Download</li>
                                <li className="dropdown-item" onClick={() => handleEditFile(f)}>Edit</li>
                                <li className="dropdown-item" onClick={() => handleDeleteFile(f.id)}>Delete</li>
                              </ul>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {page === 'keys' && (
          <div className="admin-list">
            <h3>Upload Keys</h3>
            {deleteMessage && <p className="delete-message">{deleteMessage}</p>}
            {uploadKeys.length === 0 ? (
              <p className="no-keys">No upload keys available.</p>
            ) : (
              <table className="keys-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Created At</th>
                    <th>Expires In</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadKeys.map(k => {
                    const createdTime = new Date(k.createdAt).getTime();
                    const expiryTime = createdTime + 24 * 60 * 60 * 1000;
                    const diff = expiryTime - now;
                    let expiresText;
                    if (diff <= 0) {
                      expiresText = 'Expired';
                    } else {
                      const hours = Math.floor(diff / (1000 * 60 * 60));
                      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                      const pad = num => String(num).padStart(2, '0');
                      expiresText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
                    }
                    return (
                      <tr key={k.key}>
                        <td
                          className="key-cell"
                          title={k.key}
                          onClick={() => handleCopyFromList(k.key)}
                        >
                          {k.key}
                          {newKey === k.key && <span className="new-key-badge">New!</span>}
                          {copiedKey === k.key && <span className="copy-badge">Copied!</span>}
                        </td>
                        <td className="created-cell" title={k.createdAt}>{new Date(k.createdAt).toLocaleString()}</td>
                        <td className="expires-cell">{expiresText}</td>
                        <td>
                          {pendingDeleteKey === k.key ? (
                            <>
                              <button className="confirm-button" onClick={() => confirmDelete(k.key)}>Yes</button>
                              <button className="cancel-button" onClick={() => setPendingDeleteKey(null)}>No</button>
                            </>
                          ) : (
                            <button className="delete-button" onClick={() => handleDeleteKey(k.key)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin; 
