const tempConnectionObject = {

}

const tempconnectObj__addData = ({key , value}) =>{
    tempConnectionObject[`${key}`] = value;
}

const tempconnectObj__delData = ({key}) =>{
    delete tempConnectionObject[`${key}`];
}

const tempconnectObj__checkData = ({key}) =>{
    return Object.keys(tempConnectionObject).includes(key) ? true : false;
}

const tempconnectObj__getData = ({key}) =>{
    return tempConnectionObject[key];
}

module.exports = {
    tempconnectObj__addData:tempconnectObj__addData,
    tempconnectObj__delData:tempconnectObj__delData,
    tempconnectObj__checkData:tempconnectObj__checkData,
    tempconnectObj__getData:tempconnectObj__getData
}