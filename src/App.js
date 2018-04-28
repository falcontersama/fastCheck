import React from 'react'
import axios from 'axios'
import { Button, FormControl } from 'react-bootstrap'
import styled from 'styled-components';
import Progress from 'react-progressbar';
import ReactAudioPlayer from 'react-audio-player';

var Loader = require('react-loader');

const Background = styled.div`
    width: 100vw;
    height: 100vh;
    background-color: rgb(22,135,209);
    min-width: 500px;
    min-height: 500px;
`;

const UploadBox = styled.div`
    text-align: center;
    width: 50%;
    height: 50%;
    margin: auto;
    min-width: 500px;
    padding-top: 30vh;
`;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile : null,
      page : "Home",
      progress: null,
      loaded: false,
      apiID:"",
      sound:false,
      results:null
    }
    this.fileUploadHandler = this.fileUploadHandler.bind(this)
  }


  fileSelectHandler = event => {
    this.setState({selectedFile : event.target.files[0]})
  }

  

  fileUploadHandler = event => {
    const fd = new FormData();
    let interval;
    fd.append('video', this.state.selectedFile, this.state.selectedFile.name)
    axios.post('http://localhost:5555/upload', fd, {
      onUploadProgress: progressEvent => {
        this.setState({progress:Math.round(progressEvent.loaded/progressEvent.total *100)})
        console.log('Upload progress ' + Math.round(progressEvent.loaded/progressEvent.total *100) + '%')
      }
    })
      .then(res => {
        console.log(res)
        this.setState({ apiID: "http://localhost:5555" + res.data})
      })
      .then(()=>{
        console.log(this.state.apiID)
        interval = setInterval(()=>{
            axios.get(this.state.apiID)
              .then((res)=>{
                    console.log(res.data)
                    if(res.data.Status === "SUCCEEDED"){
                      console.log("check1")
                      this.setState({results:res.data.Results,loaded:true, page : "Result", sound:true})
                      clearInterval(interval)
                    }
                }
            );
        },5000);
      })
  }

  render() {
    return (
      <Background>
        
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous" />
        {this.state.page === "Home"? 
          <UploadBox>
            <h1>Fastcheck</h1>
            <br/>
            <br/>
            <br/>
            <div style={{fontSize:"20px", color:"white", position:"relative", justifyContent: 'center', paddingLeft:"15vw", minWidth:"300px"}}>
            <FormControl
                type="file"
                onChange={this.fileSelectHandler}
                
              />
            </div>
            <br />
            <br />
            <div style={{justifyContent: 'center', minWidth:"300px"}}>
            <Button onClick={this.fileUploadHandler} >Upload!</Button>
            </div>
            
            {this.state.progress === 100 ? 
            <div style={{marginTop:"5vh"}}>
              <div><h3>Wait response from server</h3></div>
              <div style={{position:"relative", top:"0%", marginTop:"5vh"}}>
                <Loader loaded={this.state.loaded} />
              </div>
            </div>:
            <div style={{marginTop:"5vh"}}>
              {this.state.progress == null ?
                <div/>:
                <div style={{position:"relative", top:"0%", marginTop:"5vh"}}>
                  <div><h3>Uploading Video</h3></div>
                  <Progress completed={this.state.progress} />
                </div>
              }
              
            </div>}
          </UploadBox> :
          <div>
            <ReactAudioPlayer
              src="http://localhost:5555/result/getvoice"
              autoPlay={this.state.sound}
              controls
            />
          </div>
        }
        
        


      </Background>
    )
  }
}



export default App