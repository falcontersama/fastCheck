# Front End of FastCheck (Cloud Computing Project)
### How to install

```
> git clone https://github.com/falcontersama/fastcheck_frontend.git
> npm install 
```

### How to start
```
> npm start
```

## Description Code
* upload video to backend
* recieve url which you must use to follow progress from aws
* call the url until you recieve completed result
* change start page to result page
```
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
```


