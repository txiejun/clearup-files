/**
 * index.js
 * Description: 批量清除指定的文件夹目录
 * Author: txiejun
 * Contact: txiejun@126.com
 * Time: 2020/10/6 11:03
 */

// 寻找并删除文件目录

const fs = require('fs');
const path = require('path');
const rmdir = require('rmdir');

/**
 * 递归遍历目录
 * @param dir 根目录
 * @param target 目标文件夹名称
 * @param childNum 嵌套层级
 * @param ignore 忽略的文件名称列表
 */
function readdir(dir, target, childNum=2, ignore=[]){
    let result = [];
    let rootlist = fs.readdirSync(dir);
    rootlist.forEach((file)=>{
        if(file && !file.startsWith(".") && !ignore.includes(file)){
            // 排除隐藏文件或文件夹
            var pathname=path.join(dir,file)
            try{
                let stat = fs.statSync(pathname);
                if(stat.isDirectory()){
                    // 当前是文件夹 且文件夹名称和target相同则匹配成功
                    if(file == target){
                        result.push({pathname, stat});
                    }
                    else if(childNum>0){
                        let childlist = readdir(pathname, target, childNum-1, ignore);
                        result = result.concat(childlist);
                    }
                }
            }
            catch(e){
                console.log(e);
            }
        }
    });
    return result;
}

/**
 * 格式化时间
 * @param timestampOrdate
 * @param format
 * @returns {string}
 */
function formatDate(timestampOrdate, format='YYYY-MM-DD hh:mm:ss'){
    let _day = null;
    if(timestampOrdate != undefined){
        if(timestampOrdate instanceof Date){
            _day = timestampOrdate;
        }
        else{
            _day = new Date(timestampOrdate);
        }
    }
    else{
        _day = new Date();
    }

    let date = {
        "M+": _day.getMonth() + 1,
        "D+": _day.getDate(),
        "h+": _day.getHours(),
        "m+": _day.getMinutes(),
        "s+": _day.getSeconds(),
        "S+": _day.getMilliseconds()
    };
    if (/(Y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (_day.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (let k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            let $1 = RegExp.$1;
            let v = date[k];
            let str = v;
            if($1.length == 2){
                str = ("00" + v).substr(("" + v).length);
            }
            format = format.replace($1, str);
        }
    }
    return format;
}

/**
 * 寻找并删除文件目录-为了保证删除效果，请使用sudo 执行命令
 * @param dir 根目录
 * @param target 目标文件夹名称
 * @param childNum 嵌套层级
 * @param ignore 忽略的文件名称列表
 * @param days 最近days天修改过的文件夹 不处理
 */
function findAndDelete(dir, target, childNum=2, ignore=[], days=30){
    let list = readdir(dir, target, childNum, ignore);
    let nowDay = new Date().getTime();
    let gap = days * 24 * 3600 * 1000;   // 毫秒
    list = list.filter(({stat}, index)=>{
        return (nowDay - stat.mtimeMs)>gap;
    });
    list = list.sort((a, b)=>{
        return b.stat.mtimeMs - a.stat.mtimeMs;
    })
    let newlist = list.map(({pathname, stat}, index)=>{
        return `${pathname}，更新时间：${formatDate(stat.mtimeMs)}`;
    })
    console.log(`根目录为：${dir}，目标文件夹为：${target}，搜索嵌套层级：${childNum}, 忽略文件名称：${ignore.join(",")}，上次更新时间超过：${days}天的搜索结果总数为：${newlist.length}条`);
    if(newlist.length>0){
        console.log(`============ 文件列表 ============`);
        console.log(newlist.join("\n"));
    }

    // TODO: 即将批量删除文件夹目录，请谨慎操作
    // deleteList(list);
}

/**
 * 根据列表删除目录
 * @param list
 */
async function deleteList(list){
    if(list.length>0){
        console.log("=========开始删除目录=========");
        let okNum = 0;
        let failNum = 0;
        let alllist = list.map(({pathname}, index)=>{
            return new Promise((resovle, reject) => {
                rmdir(pathname, function (err, dirs, files) {
                    if(err){
                        failNum++;
                        console.log(`删除：${pathname}报错, err:${err}`);
                    }
                    else{
                        okNum++;
                        console.log(`删除：${pathname}成功！`);
                    }
                    resovle({err, pathname});
                });
            });
        })

        Promise.all(alllist).then((values) => {
            console.log(`删除完成，成功：${okNum}条，失败：${failNum}条`);
        });
    }
}

// 输入目录地址
const root = "/Users/txiejun/Documents";

findAndDelete(root, "node_modules", 3, [], 90);
findAndDelete(root, "dist", 3, ["node_modules"], 90)