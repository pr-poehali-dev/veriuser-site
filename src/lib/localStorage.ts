interface SocialNetwork {
  name: string;
  url: string;
}

export interface VerifiedUser {
  id: number;
  unique_id: string;
  username: string;
  phone: string;
  user_id: string;
  social_networks: SocialNetwork[];
  status: string;
  category: string;
  created_at: string;
}

const STORAGE_KEY = 'veriuser_data';

export const loadUsers = (): VerifiedUser[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

export const saveUsers = (users: VerifiedUser[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

export const generateUniqueId = (): string => {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `VU-${randomPart}`;
};

export const addUser = (userData: Omit<VerifiedUser, 'id' | 'unique_id' | 'created_at'>): VerifiedUser => {
  const users = loadUsers();
  const newUser: VerifiedUser = {
    ...userData,
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    unique_id: generateUniqueId(),
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const updateUser = (uniqueId: string, userData: Partial<Omit<VerifiedUser, 'id' | 'unique_id' | 'created_at'>>): VerifiedUser | null => {
  const users = loadUsers();
  const userIndex = users.findIndex(u => u.unique_id === uniqueId);
  
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    ...userData
  };
  
  saveUsers(users);
  return users[userIndex];
};

export const deleteUser = (uniqueId: string): boolean => {
  const users = loadUsers();
  const filteredUsers = users.filter(u => u.unique_id !== uniqueId);
  if (filteredUsers.length < users.length) {
    saveUsers(filteredUsers);
    return true;
  }
  return false;
};

export const getUserByUniqueId = (uniqueId: string): VerifiedUser | null => {
  const users = loadUsers();
  return users.find(u => u.unique_id === uniqueId) || null;
};

export const exportData = (): string => {
  const users = loadUsers();
  return JSON.stringify(users, null, 2);
};

export const importData = (jsonData: string): boolean => {
  try {
    const users = JSON.parse(jsonData);
    if (!Array.isArray(users)) {
      throw new Error('Invalid data format');
    }
    saveUsers(users);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};
