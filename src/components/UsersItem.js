import './UserItem.css'
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const UserItem = ({ user, onUserDelete }) => {
    return (
        <tr className="UserItem">
            <td className='UserItem-text'>
                {user.firstName}
            </td>
            <td>
                {user.username}
            </td>
            <td>
                <img src={user.avatar} alt="" width="200px" height="200px" />
            </td>
            <td>
                {user.sex}
            </td>
            <td>
                {user.role}
            </td>
            <td>
                {user.summary}
            </td>
            <td>
                {user.active}
            </td>
            <td>
                {user.registrationDateTime.split('.')[0].replace('T', ' ')}
            </td>
            <td>
                {user.lastModificationDateTime.split('.')[0].replace('T', ' ')}
            </td>
            <td className='UserItem-button' title="Edt User">
                <Link to={"/edit-user/" + user.id}>
                    EDIT
                </Link>
            </td>
            <td className="UserItem-button" title="Delete User" onClick={() => onUserDelete(user)}>
                DELETE
            </td>
        </tr>
    )
}

UserItem.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        firstName: PropTypes.string.isRequired
    }),
    onUserDelete: PropTypes.func.isRequired
}

export default UserItem;