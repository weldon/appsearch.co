import React, { Component } from "react";
import "../styles/Home.css";
import jsonp from "jsonp";

function getAppId(previewURL) {
	try {
		const re = /\d{6,}/;
		return previewURL.match(re)[0];

	} catch(err) {
		return err.messageZz;
	}
}

class Home extends Component {

	constructor(props) {
		super(props);
		this.state = {
			input: '', 
			appId: '',
			appDetails: '',
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event) {
	this.setState({input: event.target.value});
	}

	handleSubmit(event) {
		event.preventDefault();
		let appId = getAppId(this.state.input);
		let lookupURL = "https://itunes.apple.com/lookup?id=" + appId;
		jsonp(lookupURL, null, (err, data) => {
		   if (err) {
			 console.error(err.message);
		   } else {
			 this.setState({appDetails: data.results[0]});
			 let appDetails = this.state.appDetails;
			this.setState(() => ({
			}))
		   }
		 });
	 }

    
  render() {
  	const {status} = this.state;
    return (
      <div className="Home">
                <form id="previewURLForm" onSubmit={this.handleSubmit}>
        		<label>
				<p>Paste the iTunes Preview URL below:</p>
				</label>
				<p><input id="previewURL" type="text" value={this.state.input} onChange={this.handleChange} /></p>
        		<p><input type="submit" value="Submit" /></p>
      		</form>
				<p>Name: {this.state.appDetails.trackName}</p>
				<p>BundleID: {this.state.appDetails.bundleId}</p>
        <div className="lander">
          <h1>AppSearch</h1>
          <p>Brought to you by Rewind Technology</p>
        </div>
      </div>
    );
  }
}

export default Home