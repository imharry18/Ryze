import React from 'react'
import './sidePanel.css'
import {Boxes, Club,MessageCircle,Calendar, Bolt, BookHeart,ListOrdered, Trophy, LogOut,Rss, UserRoundCheck, BookA, UsersRound} from 'lucide-react'

const sidePanel = () => {
  return (
    <>
        <div class="card">
            <div className='element'><span><Trophy /></span>Score</div>
            <div className='element'><span><ListOrdered /></span>Polls</div>
            <div className='element'><span><MessageCircle /></span>Messages</div>
            <div className='element'><span><Boxes /></span>Community</div>
            <div className='element'><span><Club /></span>Clubs</div>
            <div className='element'><span><Rss /></span>Connections</div>
            <div className='element'><span><UsersRound /></span>Clan</div>
            <div className='element'><span><BookHeart /></span>Confessions</div>
            <div className='element'> <span><Calendar /></span>Events</div>
            <div className='element'> <span><Bolt /></span>Settings</div>
            <div className='element'><span><BookA /></span>About Ryze </div>
            <div className='element'> <span><UserRoundCheck /></span>Contact</div>
            <div className='element'> <span><LogOut /></span>Logout</div> 
        </div>

    </>
  )
}

export default sidePanel