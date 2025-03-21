import { LightningElement, track, wire } from 'lwc';
import taskrecord from '@salesforce/apex/TaskList.taskrecord';
import Defaultvalue from '@salesforce/apex/TaskList.DefaultPost';
const columns = [
    
    
    { label: 'Profile Name', fieldName: 'ProfileName',wrapText: true},
    { label: 'Created By', fieldName: 'CreatedByName',wrapText: true},  
    { label: 'Related Type ', fieldName: 'Relatedtype',initialWidth: 134,wrapText: true},
    { label: 'Related To', fieldName: 'Relatedto',wrapText: true},
    { label: 'Body', fieldName: 'BodyData',wrapText: true, type:'Richtext'},
    { label: 'Title', fieldName: 'Titles',wrapText: true},
    { label: 'Like Count', fieldName: 'LikeCount',initialWidth: 90,wrapText: true},
    { label: 'Comment Count', fieldName: 'CommentCount',initialWidth: 134,wrapText: true},
    { label: 'Feed Type', fieldName: 'Type',initialWidth: 134,wrapText: true},
];

export default class ChatterPost extends LightningElement {
    get Regionvalue(){
        return [
            {label: 'East',value: 'East'},
            {label: 'West',value: 'West'},
            {label: 'North',value: 'North'},
            {label: 'South',value: 'South'},
        ];
    }
    get Businessvalue(){
        return [
            {label: 'Infinity',value: 'Infinity'},
            {label: 'Inspire',value: 'Inspire'},
        ];
    }
    
    
    get Datevalue(){
        return [
            {label: 'Current Month',value: 'CurrentMonth'},
            {label: 'Last Month',value: 'LastMonth'},
            {label: 'Custom Date',value: 'CustomDate'},
        ];
    }
    value =[];
    @track data = [];
    @track columns = columns;
    @track error ='';
    @track isfilter = false;
    @track ShowDate = false;
    @track loaded = true;
    @track Bvalue;
    @track Rvalue;
    @track Dvalue;
    @track fdate;
    @track tdate;
    Business ='';
    Region = '';
    FromDate = null;
    ToDate = null;
    Date ='';
    DownloadDatas =[];
    


    @wire (Defaultvalue)
      intialvalue({data,error}){
        if(data){
            this.DownloadDatas = data;
            this.data = data.map(row =>{
                return {...row,ProfileName : row.CreatedBy.Profile.Name,CreatedByName: row.CreatedBy.Name,Relatedtype:row.Parent.Type,
                    BodyData:row.Body ==null?'':row.Body.replace( /(<([^>]+)>)/ig, ''),Titles:(row.Title ===null ||row.Title === undefined)?'': row.Title
                    ,Relatedto:row.Parent.Name}
             });
                 this.data.forEach(record => {
                     console.log('Title....'+record.Title);
                     console.log('Titles....'+record.Titles);
                 });          
            this.loaded = false;
            this.error = undefined;

        }
        if(error){
            this.error = error;
            this.data = undefined;
        }
      }


    showtemplate(){

        this.isfilter = true;
        this.Bvalue = this.Business;
        this.Rvalue = this.Region;
        this.Dvalue = this.Date;
        this.tdate = this.ToDate;
        this.fdate = this.FromDate;

    }
    hideModalBox(){
        this.isfilter = false;
    }
    handleBusiness(event){
       this.Business = event.target.value;
       console.log('businessvalue'+this.Business);
      

    }
    handleRegion(event){
        this.Region = event.target.value;
    }
    
    handleDate(event){
        this.Date= event.target.value;
        if(this.Date =='CustomDate'){
            this.ShowDate = true;   
        }else{
            this.ShowDate = false;
        }
    }
    fromDateChange(event){
       this.FromDate = event.target.value;
    }
    toDateChange(event){
        this.ToDate = event.target.value;
    }
    
    Applyfilter(){
           
           this.isfilter = false;
           this.loaded = true;
           
            if(this.Date == 'CurrentMonth' ||this.Date == 'LastMonth'){
            this.FromDate = undefined;
            this.ToDate = undefined;
         }

          
        taskrecord({Region:this.Region,Business:this.Business,Dates:this.Date,FromDate:this.FromDate,ToDate:this.ToDate})
        .then(result=>{
            console.log('data====>'+JSON.stringify(result))
            this.data = result.map(row =>{
                return {...row,ProfileName : row.CreatedBy.Profile.Name,CreatedByName: row.CreatedBy.Name,Relatedtype:row.Parent.Type,
                    BodyData:row.Body ==null?'':row.Body.replace( /(<([^>]+)>)/ig, ''), Relatedto:row.Parent.Name }
             });
             
             this.error = undefined;
        })
        .catch(error=>{
            
            this.error = error.body.message;
        })
      
      this.loaded = false;
    } 
    DownloadData(){
        // Prepare a html table
        let doc = '<table>';
        // Add styles for the table
        doc += '<style>';
        doc += 'table, th, td {';
        doc += '    border: 1px solid black;';
        doc += '    border-collapse: collapse;';
        doc += '}';          
        doc += '</style>';
        // Add all the Table Headers
        doc += '<tr>';
                   
            doc += '<th>'+ 'ProfileName' +'</th>';
            doc += '<th>'+ 'CreatedByName' +'</th>';
            doc += '<th>'+ 'Relatedtype' +'</th>';           
            doc += '<th>'+ 'Relatedto' +'</th>';
            doc += '<th>'+ 'BodyData' +'</th>';
            doc += '<th>'+ 'Title' +'</th>';
            doc += '<th>'+ 'LikeCount' +'</th>';
            doc += '<th>'+ 'CommentCount' +'</th>';
            doc += '<th>'+ 'Type' +'</th>'; 
        doc += '</tr>';
        // Add the data rows
        this.data.forEach(record => {
            
            doc += '<tr>';
            doc += '<th>'+record.ProfileName+'</th>'; 
            doc += '<th>'+record.CreatedByName+'</th>'; 
            doc += '<th>'+record.Relatedtype+'</th>';
            doc += '<th>'+record.Relatedto+'</th>';
            doc += '<th>'+record.BodyData+'</th>';
            doc += '<th>'+record.Titles+'</th>';
            doc += '<th>'+record.LikeCount+'</th>';
            doc += '<th>'+record.CommentCount+'</th>'; 
            doc += '<th>'+record.Type+'</th>';
            doc += '</tr>';
        });
        doc += '</table>';
        var element = 'data:application/vnd.ms-excel,' + encodeURIComponent(doc);
        let downloadElement = document.createElement('a');
        downloadElement.href = element;
        downloadElement.target = '_self';
        // use .csv as extension on below line if you want to export data as csv
        downloadElement.download = 'Contact Data.xls';
        document.body.appendChild(downloadElement);
        downloadElement.click();   
          
        }
}
