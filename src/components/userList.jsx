import React from 'react'
import './userList.css'
import Button from './officialButton'
import {RefreshCcw} from 'lucide-react'

function userList(){
  return (
    <>
    <div id='userlistBox'>
      <div id='list'><div className='listItem'><div id='dp'><img src="./logo.png" alt="" /></div><div id='username'>ryze</div><div id='addFriendButton'><Button text="add friend"/></div></div></div>
      <div id='list'><div className='listItem'><div id='dp'><img src="./logo.png" alt="" /></div><div id='username'>ryze</div><div id='addFriendButton'><Button text="add friend"/></div></div></div>
      <div id='list'><div className='listItem'><div id='dp'><img src="./logo.png" alt="" /></div><div id='username'>ryze</div><div id='addFriendButton'><Button text="add friend"/></div></div></div>
      <div id='list'><div className='listItem'><div id='dp'><img src="./logo.png" alt="" /></div><div id='username'>ryze</div><div id='addFriendButton'><Button text="add friend"/></div></div></div>
      <div id='list'><div className='listItem'><div id='dp'><img src="./logo.png" alt="" /></div><div id='username'>ryze</div><div id='addFriendButton'><Button text="add friend"/></div></div></div>
      <div id='list'><div className='listItem'><div id='dp'><img src="./logo.png" alt="" /></div><div id='username'>ryze</div><div id='addFriendButton'><Button text="add friend"/></div></div></div>
      <div id='list'><div className='listItem'><div id='dp'><img src="./logo.png" alt="" /></div><div id='username'>ryze</div><div id='addFriendButton'><Button text="add friend"/></div></div></div>
      <div id='list'><div className='listItem'><div id='dp'><img src="./logo.png" alt="" /></div><div id='username'>ryze</div><div id='addFriendButton'><Button text="add friend"/></div></div></div>
      <div id='list'><div className='listItem'><div id='dp'><img src="./logo.png" alt="" /></div><div id='username'>ryze</div><div id='addFriendButton'><Button text="add friend"/></div></div></div>
      <div id='listRefresh'><div className='listItemRefresh'><RefreshCcw /></div></div>
    </div>
    </>
  )
}
export default userList
