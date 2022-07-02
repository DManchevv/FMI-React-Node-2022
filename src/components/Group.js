import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/targetGroups.css'

export default function Group({targetGroup}) {
    return(
        <tr>
            <td className="user-id">{targetGroup.id}</td>
            <td>{targetGroup.name}</td>
            <td>{targetGroup.recipients}</td>
        </tr>
    );
}