// Copyright (c) 2018 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {Component} from 'react';
import {connect} from 'react-redux';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import KeplerGl from 'kepler.gl';
// Kepler.gl Schema APIs
import KeplerGlSchema from 'kepler.gl/schemas';
// Kepler.gl actions
import {addDataToMap} from 'kepler.gl/actions';
// Kepler.gl Data processing APIs
import Processors from 'kepler.gl/processors';

import Button from './button';
import downloadJsonFile from "./file-download";

import polygonCsvConfig from './data/polygon_csv_config.json';
import pointCsvConfig from './data/point_csv_config.json';


const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

class App extends Component {
  componentDidMount() {
    console.log('url: ', this.getQueryParam('everstoreurl'));
    let data_url = this.getQueryParam('everstoreurl');
    fetch(data_url).then((response) => {
        console.log('Got response');
        return response.text();
        //return response.json();
      }).catch((error) => {
        console.error("Fetch Error =", error);
      }).then((response_data) => {
        console.log('Got json');
        try {
          //const data = Processors.processGeojson(response_data);
          const data = Processors.processCsvData(response_data);
          const dataset = {
            data,
            info: {
              // `info` property are optional, adding an `id` associate with this dataset makes it easier
              // to replace it later
              id: 'my_data'
            }
          };

          const config = this.getMapConfig();

          // Create dataset structure
          // addDataToMap action to inject dataset into kepler.gl instance
          console.log('data: ', data);
          this.props.dispatch(addDataToMap({datasets: dataset, config}));
        } catch (error) {
          console.error('Process data error: ', error);
        }
      });

  }

  getQueryParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  getMapConfig() {
    console.log('getMapConfig()!!!!');
    const style = this.getQueryParam('style')
    if (style === 'polygon') {
      return polygonCsvConfig;
    } else if (style === 'point') {
      return pointCsvConfig;
    } else {
      return '';
    }
  }


  // This method is used as reference to show how to export the current kepler.gl instance configuration
  // Once exported the configuration can be imported using parseSavedConfig or load method from KeplerGlSchema
  // getMapConfig() {
  //   // retrieve kepler.gl store
  //   const {keplerGl} = this.props;
  //   // retrieve current kepler.gl instance store
  //   const {map} = keplerGl;

  //   // create the config object
  //   return KeplerGlSchema.getConfigToSave(map);
  // }

  // This method is used as reference to show how to export the current kepler.gl instance configuration
  // Once exported the configuration can be imported using parseSavedConfig or load method from KeplerGlSchema
  exportMapConfig = () => {
    // create the config object
    const mapConfig = this.getMapConfig();
    // save it as a json file
    downloadJsonFile(mapConfig, 'kepler.gl.json');
  };

  render() {
    return (
      <div style={{position: 'absolute', width: '100%', height: '100%'}}>
        <AutoSizer>
          {({height, width}) => (
            <KeplerGl
              mapboxApiAccessToken={MAPBOX_TOKEN}
              id="map"
              width={width}
              height={height}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}

const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({dispatch});

export default connect(mapStateToProps, dispatchToProps)(App);
