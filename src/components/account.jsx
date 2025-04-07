import './account.css'
import {Ellipsis} from 'lucide-react';
import Buttons from "./officialButton";
import GridPost from "./gridPost";
import Post from "./post";
function account(){
    return(
        <>
        <div id='accountSection'>
            <div id='DP'><img src="./logo.png" alt="" /></div>
                <div>
                    <div id="userDetails">
                        <div>ryze</div>
                        <div><Buttons text="following" /></div>
                        <div><Ellipsis /></div>
                    </div>
                    <div id="accountDetails">
                        <div><span>7</span> posts</div>
                        <div><span>618</span> followers</div>
                        <div><span>555</span> following</div>
                    </div>
                    <div id="bioWithName">
                        <div>Harish Chouhan</div>
                        <div id='bio'>
                            <div>believe</div>
                            <div>jammu</div>
                            <div>cricket</div>
                        </div>
                    </div>
                </div>
        </div>
        <hr />
        <div id='posts'>
            <GridPost link="red"/>
            <GridPost link="blue"/>
            <GridPost link="skyblue"/>
            <GridPost link="green"/>
            <GridPost link="yellow"/>
            <GridPost link="red"/>
            <GridPost link="blue"/>
        </div>
        <hr />
        <div id='accountPostView'>
            <Post />
        </div>
        </>
    )
}
export default account