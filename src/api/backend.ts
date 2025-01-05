import { AuthUser } from 'aws-amplify/auth';
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


const updatePositionOnServer = async(user: AuthUser): Promise<void> => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
         const t_iam:user = {
          name: user?.username as string,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }
        await sendUserPosition(t_iam);
      },
      (error) => {
        console.error("Error getting geolocation:", error);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}

export {sendUserPosition, getUserPosition, updatePositionOnServer}