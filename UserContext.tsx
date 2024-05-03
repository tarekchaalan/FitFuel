import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { auth, firestore } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  setUser: (user: User) => void;
}

interface User {
  displayName?: string;
  photoURL?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  loading: true,
  setUser: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

interface UserProviderProps {
  children: ReactNode; // Define the type for children
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = (user: User) => {
    setCurrentUser(user);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(firestore, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setCurrentUser({
            displayName: user.displayName ?? undefined,
            username: userData.username,
            email: user.email ?? undefined,
            phoneNumber: userData.phoneNumber,
            photoURL:
              user.photoURL ||
              require("./assets/images/profile-placeholder.jpg"),
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, loading, setUser }}>
      {!loading && children}
    </UserContext.Provider>
  );
};
