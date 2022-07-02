import './UsersList.css'
import React from 'react'
import UserItem from './UsersItem'
import { useEffect, useState } from 'react';

const UsersList = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch('/api/users')
        .then(response => response.json())
        .then(data => {
            setUsers(data);
        })
    }, [])

    const deleteUser = user => {
        fetch(`/api/users/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          setUsers(oldUsers => oldUsers.filter(r => r.id !== data.id));
        });
      }
    
    return (
        <table>
            <tbody>
                <tr className='UserItem'>
                    <td>
                        First Name
                    </td>
                    <td>
                        Username
                    </td>
                    <td>
                        Avatar
                    </td>
                    <td>
                        Sex
                    </td>
                    <td>
                        Role
                    </td>
                    <td>
                        Summary
                    </td>
                    <td>
                        Active
                    </td>
                    <td>
                        Registration Time
                    </td>
                    <td>
                        Last Modification Time
                    </td>
                    <td>Edit User</td>
                    <td>
                        Delete User
                    </td>
                </tr>
                {users
                .map(user => (
                    <UserItem key={user.id} user={user} onUserDelete={deleteUser} />
                ))}
            </tbody>
        </table>
    )
}

UsersList.propTypes = {
}

export default UsersList;