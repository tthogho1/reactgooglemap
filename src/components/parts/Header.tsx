import React, { useState } from 'react';
import { Menu,X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async (event: React.MouseEvent) => {
    event.preventDefault(); 
    try{
      await logout();
      navigate("/login");
      console.log("サインアウト処理を実行");
    }catch(error){
      console.log(error);
      console.log("サインアウトに失敗しました。");
    }
  };

  return (
    <header className="bg-blue-600 text-white p-2">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <nav className="hidden md:flex space-x-4">
          <button onClick={handleSignOut}>Sign Out</button>
        </nav>
        <button className="md:hidden" onClick={toggleMenu}>
          <Menu size={24} />
        </button>
      </div>

      {/* サイドメニュー */}
      <div
        className={`fixed top-0 right-0 h-full w-64 z-20 bg-blue-800 p-4 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button className="absolute top-4 right-4" onClick={toggleMenu}>
          <X size={24} />
        </button>
        <nav className="mt-8">
          <ul className="space-y-4">
            <li><button onClick={handleSignOut}>Sign Out</button></li>
          </ul>
        </nav>
      </div>

      {/* オーバーレイ */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleMenu}
        ></div>
      )}

    </header>
  );
};

export default Header;