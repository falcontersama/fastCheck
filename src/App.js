import React from 'react'
import axios from 'axios'
import "./App.css"
import { Button, Table } from 'react-bootstrap'
import styled from 'styled-components'
import Progress from 'react-progressbar'
import ReactAudioPlayer from 'react-audio-player'
import $ from 'jquery'


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

const ChooseFileBox = styled.div`
    font-size: 30px; 
    color: white; 
    justify-content: center; 
    text-align: center;
    padding: 20px;
`

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
      results:{}
    }
    this.fileUploadHandler = this.fileUploadHandler.bind(this)
    this.toggleAttend = this.toggleAttend.bind(this)
  }


  fileSelectHandler = event => {

    this.setState({selectedFile : event.target.files[0]})
    let label = $('input').next('.js-labelFile')
    let labelVal = label.html();
    let fileName = '';
    if (event.target.value) fileName = event.target.value.split('\\').pop();
    fileName ? label.addClass('has-file').find('.js-fileName').html(fileName) : label.removeClass('has-file').html(labelVal);
   
  }

  

  fileUploadHandler = event => {
    $('input')[0].disabled = true
    
    const fd = new FormData()
    let interval
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
                })
        },5000);
      })
  }

  toggleAttend(idx){
    console.log(idx)
    if(this.state.results[idx] === "present"){
      let results = this.state.results
      results[idx] = "absent"
      this.setState({results:results})
      this.forceUpdate()
    }else if(this.state.results[idx] === "absent"){
      let results = this.state.results
      results[idx] = "present"
      this.setState({results:results})
      this.forceUpdate()
    }
  }

  render() {
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
        
        {this.state.page === "Home"? 
        <div className="context" style={{top:"30vh"}}>
            <UploadBox>
              <h1 style={{color:"white"}}>Fastcheck</h1>
              <br/>
              <br/>
              <br/>
              <ChooseFileBox>
              {/* <FormControl
                  type="file"
                  onChange={this.fileSelectHandler}
                  style={{color:"red"}}
                /> */}
              <div className="form-group">
                <input type="file" name="file" id="file" className="input-file" onChange={this.fileSelectHandler}/>
                <label htmlFor="file" className="btn btn-tertiary js-labelFile">
                  <i className="icon fa fa-check"></i>
                  <span className="js-fileName" style={{margin:"10px"}}>Choose a file</span>
                </label>
              </div>
              </ChooseFileBox>
              <br />
              <br />
              <div style={{justifyContent: 'center', minWidth:"300px"}}>
              <Button style={{fontSize:"30px"}} bsStyle="success" onClick={this.fileUploadHandler} >Upload!!!</Button>
              </div>
              
              {this.state.progress === 100 ? 
              <div style={{marginTop:"5vh"}}>
                {this.state.waitRekog === true? 
                  <div><h3 style={{color:"white"}}>Wait response from Rekognition, Comparing Pictures</h3></div>:
                  <div><h3 style={{color:"white"}}>Wait response from server, Processing video</h3></div>
                }
                
                <div style={{position:"relative", top:"0%", marginTop:"5vh"}}>
                  <Loader loaded={this.state.loaded} color="#FFF" />
                </div>
              </div>:
              <div style={{marginTop:"5vh"}}>
                {this.state.progress === null ?
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
              <h1>Who is attending ?</h1>
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
                        <td><h3>{key}</h3></td>
                        <td><h3>{value} &nbsp;&nbsp;&nbsp;<Button bsStyle="success" bsSize="large" onClick={()=>{this.toggleAttend(key)}}>Change</Button></h3></td>
                        
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