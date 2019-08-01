import React from 'react';
import ReactDataGrid from 'react-data-grid';
import Papa from 'papaparse';
import './GridUser.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import { CSVLink } from "react-csv";

class App extends React.Component {
  constructor(props){
    super(props);
    this.state={
      columns : null,
      rows : null, 
      isLoading : true,
    }
    this.getData = this.getData.bind(this);
    this.onGridRowsUpdated = this.onGridRowsUpdated.bind(this);
    this.sortRows = this.sortRows.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);    
  }
  getData(result) {

    let columnsArray = result.data[0].map((data)=>{
      return {
        key: data,
        name: data,
        editable: true,
        sortable: true,
        width : 200,
      }
    })
    let formateDataForGrid = async (datas) => {
      return new Promise((resolve, reject) => {
        let row = [];

        for (let i = 1; i < datas.length; i++) {
          let tempRow = datas[i].map((data, index) => {
            return {
              [columnsArray[index].key]: data
            }

          })
          row.push(Object.assign({}, ...tempRow))
        }
        resolve(row)
      })
    }
    
    formateDataForGrid(result.data).then(result=>{
      this.setState({ columns: columnsArray, rows: result, isLoading:false });
    })
    
  }

  async fetchCsv() {
    return await fetch('/data/excel.csv')
    .then((response)=> {
      return response.text()
    })
  }

  async getCsvData() {

    /**With fetch method --************************************************************* > 
    let csvData = await this.fetchCsv();
    Papa.parse(csvData, {
      complete: this.getData
    });
  With Papaparse module method -********************************************************- > */

    Papa.parse('/data/excel.csv', {
      download: true,
      complete: this.getData
    });
    
  }

  handleSubmit (){
    let url = '/data/test.json';
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8;');
    xhr.send();

    if (this.readyState == 4) {
      var response = JSON.parse(this.state.rows);
    }

    if (this.status != 200) {
      console.log('error: ' + (this.status ? this.statusText : 'request failed'));
    }

  }
  
  onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
    console.log('ici')
    this.setState(state => {
      const rows = state.rows.slice();
      for (let i = fromRow; i <= toRow; i++) {
        rows[i] = { ...rows[i], ...updated };
      }
      return { rows };
    });
  };
  sortRows = (initialRows, sortColumn, sortDirection) =>{
    const comparer = (a, b) => {
      if (sortDirection === "ASC") {
        return a[sortColumn] > b[sortColumn] ? 1 : -1;
      } else if (sortDirection === "DESC") {
        return a[sortColumn] < b[sortColumn] ? 1 : -1;
      }
    };
    return sortDirection === "NONE" ? initialRows : [...initialRows].sort(comparer);
  };

  componentDidMount(){
    this.setState({ isLoading: true });
    this.getCsvData();
  }
  
  render(){

    let gridData;
      if (this.state.isLoading) {
        gridData = <CircularProgress color="secondary" />
      }else{
          gridData = 
            <div className='gridData'>
            <ReactDataGrid 
              columns={this.state.columns}
              rowGetter={i => this.state.rows[i]}
              rowsCount={this.state.rows.length}
              onGridRowsUpdated={this.onGridRowsUpdated}
              enableCellSelect={true}
              minHeight={800}
              headerRowHeight={50}
              onGridSort={(sortColumn, sortDirection) => {
                console.log('click');
               this.setState({
                 rows: this.sortRows(this.state.rows, sortColumn, sortDirection)
               })
              }

              } />
              <div id='buttonValidate'>
                <input onClick={this.handleSubmit} type='submit'/>
                {
                  //<CSVLink data={this.state.rows}>Download me</CSVLink> ************************* Lien pour télecharger directement un fichier CSV
                }
              </div>
          </div>

      }
      return (
        <div className="App">
           {gridData}
       </div>
      );
   }
  }


export default App;
