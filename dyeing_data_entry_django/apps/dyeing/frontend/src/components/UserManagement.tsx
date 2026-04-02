import React, { useState } from 'react';
import { Users, Plus, Trash2, Shield, User as UserIcon } from 'lucide-react';

export default function UserManagement({ users, setUsers, showToast }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'operator' });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some((u: any) => u.username === newUser.username)) {
      showToast('用户名已存在', 'error');
      return;
    }
    setUsers([...users, { ...newUser, id: Date.now().toString() }]);
    setIsAdding(false);
    setNewUser({ username: '', password: '', name: '', role: 'operator' });
    showToast('用户添加成功', 'success');
  };

  const handleDelete = (id: string) => {
    if (users.length === 1) {
      showToast('无法删除最后一个用户', 'error');
      return;
    }
    setUsers(users.filter((u: any) => u.id !== id));
    showToast('用户已删除', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            用户管理
          </h2>
          <p className="mt-1 text-sm text-gray-500">管理系统登录用户及权限分配</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加用户
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 bg-white shadow sm:rounded-lg border border-gray-200 overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">新增用户</h3>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">用户名</label>
                <input type="text" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">姓名</label>
                <input type="text" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">密码</label>
                <input type="text" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">角色</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white outline-none">
                  <option value="operator">操作员</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div className="sm:col-span-4 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">取消</button>
                <button type="submit" className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {users.map((user: any) => (
            <li key={user.id}>
              <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {user.role === 'admin' ? (
                        <Shield className="h-10 w-10 text-purple-500 bg-purple-100 p-2 rounded-full" />
                      ) : (
                        <UserIcon className="h-10 w-10 text-blue-500 bg-blue-100 p-2 rounded-full" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {user.role === 'admin' ? '管理员' : '操作员'}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="truncate">登录名: {user.username}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 flex gap-2">
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="删除用户">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
