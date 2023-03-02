function onCheck(){
    var treeObj=$.fn.zTree.getZTreeObj("treeReal"),
        nodes=treeObj.getCheckedNodes(true),
        v="";
    for(var i=0;i<nodes.length;i++){
        v+=nodes[i].name + ",";
        alert(nodes[i].id); //获取选中节点的值
    }
}
