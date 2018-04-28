import React from 'react'
import axios from 'axios'
import "./App.css"
import { Button, FormControl, Table } from 'react-bootstrap'
import styled from 'styled-components'
import Progress from 'react-progressbar'
import ReactAudioPlayer from 'react-audio-player'


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
    min-width: 400px;
`;

const ResultBox = styled.div`
    text-align: center;
    width: 50%;
    margin: auto;
    min-width: 300px;
`

const TableBox = styled.div`
    max-height:60vh;
    overflow-y:scroll;
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
      waitRekog: false,
      results:{"arh":"present", "ter":"absent", "ter1":"absent", "ter2":"absent", "ter3":"absent","ter4":"absent", "ter5":"absent", "ter6":"absent", "ter7":"absent"}
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
        this.setState({ apiID: "http://localhost:5555" + res.data, waitRekog:true})
      })
      .then(()=>{
        interval = setInterval(()=>{
            axios.get(this.state.apiID)
              .then((res)=>{
                    if(res.data.Status === "SUCCEEDED"){
                      console.log(res.data)
                      this.setState({ results:res.data.StatusList,
                                      loaded:true, 
                                      page : "Result", 
                                      sound:true})
                      clearInterval(interval)
                    }
                }
            );
        },5000);
      })
  }

  render() {
    const { vals } = this.state;
    return (
      <Background>
        <div className="area" >
            <ul className="circles" style={{marginBottom:"0px"}}>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
            </ul>
        </div >

        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous" />
        
        {this.state.page === "Home"? 
        <div className="context" style={{top:"30vh"}}>
            <UploadBox>
              <h1 style={{color:"white"}}>Fastcheck</h1>
              <br/>
              <br/>
              <br/>
              <div style={{fontSize:"20px", color:"white", justifyContent: 'center', paddingLeft:"15vw", minWidth:"300px"}}>
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
                {this.state.waitRekog == true? 
                  <div><h3>Wait response from Rekognition, Comparing Picture</h3></div>:
                  <div><h3>Wait response from server, processing video</h3></div>
                }
                
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
            </UploadBox>
          </div> :
          <div className="context" style={{top:"10vh"}}>
            <ResultBox>
              <h1>Who is attendance ?</h1>
              <ReactAudioPlayer
                src="http://localhost:5555/getvoice"
                autoPlay={this.state.sound}
                controls
              />
              <br />
              <br />
              <TableBox>
                <Table responsive bordered style={{height:"100px", overflow:"auto"}}>
                  <thead style={{color:"white", backgroundColor:"rgba(0,0,0,0.7)"}}>
                    <tr>
                      <th style={{textAlign:"center"}}><h3>Name</h3></th>
                      <th style={{textAlign:"center"}}><h3>Attendance</h3></th>
                    </tr>
                  </thead>
                  <tbody style={{color:"white", backgroundColor:"rgba(0,0,0,0.4)"}}>
                    {Object.entries(this.state.results).map(([key, value]) =>(
                      <tr key={key}>
                        <td><h5>{key}</h5></td>
                        <td><h5>{value}</h5></td>
                      </tr>
                    ))}

                  </tbody>
                </Table>
              </TableBox>
            </ResultBox>
            
          </div>
        }
  
      </Background>
    )
  }
}



export default App