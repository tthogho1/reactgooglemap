import type {user} from '../types/map';

const sendUserPosition = async (data: user): Promise<Response> => {
    try {
      const response = await fetch(`/position`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        //throw new Error(`HTTP error! status: ${response.status}`);
        alert("failed to register user position. ");
      }
  
      return response;
    } catch (error) {
      console.error('Error sending position:', error);
      throw error;
    }
  }

  const getUserPosition = async (name?: string): Promise<user[]> => {
    if (!name) {
      name ="";
    }
    let data = {name:name};

    try {
      const response = await fetch(`/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        //throw new Error(`HTTP error! status: ${response.status}`);
        alert("failed to get all users position");
      }
  
      const users = await response.json();
      return users.users;
    } catch (error) {
      console.error('Error sending position:', error);
      throw error;
    }
  }

export {sendUserPosition, getUserPosition}