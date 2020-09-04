
package com.redoop.science.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.entity.RealDb;
import com.redoop.science.mapper.RealDbMapper;
import com.redoop.science.service.IRealDbService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.*;
import java.util.Date;


/**
 * <p>
 * 实体数据源库 服务实现类
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
@Service
public class RealDbServiceImpl extends ServiceImpl<RealDbMapper, RealDb> implements IRealDbService {

    @Autowired
    RealDbMapper realDbMapper;


    @Override
    public IPage<RealDb> pageList(Page<RealDb> page, Map params) {
        return realDbMapper.findByRole(page,params);
    }

    @Override
    public List<RealDb> findByRole(Integer id) {
        return realDbMapper.findByUserId(id);
    }

    /**
     * 根据数据源别名查询
     * @param nikeName
     * @return
     */
    @Override
    public RealDb findByNikeName(String nikeName) {
        return realDbMapper.findByNikeName(nikeName);
    }

    /**
     * 增加
     * @param realDb
     */
    @Override
    public void saveForm(RealDb realDb) {

        realDb.setCreateDate(new Date());
        //判断用户为null的时候添加创建人
        if (realDb.getCreatorName()==null || "".equals(realDb.getCreatorName())){
            realDb.setCreatorName("admin");
        }
        realDb.setOperationTime(new Date());
        //根据类型添加类型图片
        realDb.setLogo(" /img/realDb/"+realDb.getDbType()+".jpg");
        realDbMapper.insert(realDb);
    }

    @Override
    public IPage<RealDb> pageListAdmin(Page<RealDb> page) {
        return realDbMapper.pageListAdmin(page);
    }

/**
     * 查看库中的表信息
     * @return
     */
   /* @Override
    public List<RealDb> selectDatabase() {

       String JDBC_DRIVER = "com.mysql.jdbc.Driver";
       String DB_URL = "jdbc:mysql://127.0.0.1/data_science?serverTimezone=UTC&useUnicode=true&characterEncoding=utf8&autoReconnect=true&rewriteBatchedStatements=TRUE&useSSL=false&allowPublicKeyRetrieval=true";

       String USER = "root";
       String PASS = "root";




        Connection conn = null;
        Statement stmt = null;
        List list = new ArrayList();
        try{
            //STEP 2: 注册JDBC驱动程序
            Class.forName(JDBC_DRIVER);

            //STEP 3: 打开连接
            System.out.println("查询数据库");
            conn = DriverManager.getConnection(DB_URL, USER, PASS);
            System.out.println("连接数据库成功...");

            //STEP 4: 执行查询
            System.out.println("创建查询...");
            stmt = conn.createStatement();

            String sql = "select TABLE_NAME from information_schema.tables where table_schema='data_science'";

            ResultSet rs = stmt.executeQuery(sql);
            //获取键名
            ResultSetMetaData md = rs.getMetaData();
            //获取行的数量
            int columnCount = md.getColumnCount();

            while (rs.next()){
                //声明Map
                Map rowData = new HashMap();
                for (int i = 1; i <= columnCount; i++) {
                    //获取键名及值
                    rowData.put(md.getColumnName(i),rs.getObject(i));
                }
                list.add(rowData);
            }
            System.out.println("list++++++++++++++++++++"+list.toString());
            rs.close();
        }catch(SQLException se){
            //处理JDBC的错误
            se.printStackTrace();
        }catch(Exception e){
            //处理Class.forName的错误
            e.printStackTrace();
        }finally{
            //finally块用于关闭资源
            try{
                if(stmt!=null)
                    conn.close();
            }catch(SQLException se){
            }// do nothing
            try{
                if(conn!=null)
                    conn.close();
            }catch(SQLException se){
                se.printStackTrace();
            }//结束
        }//异常结束

        System.out.println("Goodbye!");
        return list;
    }*/


}