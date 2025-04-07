import './navbar.css'
import InputBox from './inputBox'

import { Home, User, Dot, Flame, CircleFadingPlus, Megaphone, Menu} from 'lucide-react';

function navbar() {
  return (
    <>
      <div id="navBox">
        <div className="navItem1" id='navLogo'><img src="/logo.png"/>Ryze</div>
        <div className="navItem1" id='navSearch'><InputBox placeString="Search Here" /></div>
        <div className="navItem2" id='navHome'><Home /><Dot className='dot'/></div>
        <div className="navItem2" id='navHome'><Flame /><Dot className='dot'/></div>
        <div className="navItem2" id='navLogin'><CircleFadingPlus /><Dot className='dot'/></div>
        <div className="navItem2" id='navLogin'><Megaphone /><Dot className='dot'/></div>
        <div className="navItem2" id='navLogin'><User /><Dot className='dot'/></div>
        <div className="navItem2" id='navSetting'><Menu  /><Dot className='dot'/></div>
      </div>
    </>
  )
}

export default navbar