
package com.redoop.science.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.redoop.science.entity.SysRoleVirtualTables;
import com.redoop.science.common.MlSql;
import com.redoop.science.entity.SysUserDetails;
import com.redoop.science.entity.VirtualTables;
import com.redoop.science.service.*;
import com.redoop.science.utils.*;
import okhttp3.HttpUrl;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * @Author: Alan
 * @Time: 2018/9/20 9:52
 * @Description:
 */
@RestController
@RequestMapping("/run")
public class JobController {
    Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private IVirtualTablesService virtualTablesService;
    @Autowired
    private MlSql mlSql;

    @Autowired
    ISysUserRoleService userRoleService;
    @Autowired
    ISysRoleVirtualService roleVirtualService;

    @PostMapping("/script")
    @ResponseBody
    public Result<String> script(HttpServletRequest request, @RequestParam(value = "sql") String sql, @RequestParam(value = "sqlName") String sqlName) throws Exception {


        Result<String> stringResult = new Result<>(ResultEnum.FAIL);
        String result = "";
        // String fileName = sqlName;

        try {
            String runSql = ParseSql.parse(sql);
            HttpUrl url = new HttpUrl.Builder()
                    .scheme("http")
                    .host(mlSql.getIp())
                    .port(mlSql.getPort())
                    .addPathSegments("run\\script")
                    .addQueryParameter("sql", runSql)
                    .build();
            String sqlResult = HttpClient.httpPost(url, "");
            result = sqlResult;
        } catch (IOException e) {
            e.printStackTrace();
        }
        logger.info("sql查询返回结果>>>>>>>" + result);
        if (JsonUtil.isJSONValid(result)) {
            stringResult = new Result<String>(ResultEnum.SECCUSS, result);

            //查询结果(json),将json保持为csv文件(upload/files/*.csv)
            FileUtils.writeStringToFile(new File("upload/files/" + sqlName + ".csv"), PoiUtils.json_to_csv(result));
            /*保存json格式文件
            DownLoadFiles down = new DownLoadFiles();
            String   filePath ="upload/files/";
            down.createJsonFile(result,filePath, fileName,null);*/

        } else {
            stringResult = new Result<String>(ResultEnum.FAIL, result);
        }
        return stringResult;
    }

    /**
     * 查询保存虚拟库表
     * @param request
     * @param id
     * @param sql
     * @param sqlName
     * @return
     */
    @PostMapping("/save")
    @ResponseBody
    public Result save(HttpServletRequest request,
                       @RequestParam(name = "id", required = false) Long id,
                       @RequestParam(name = "sql") String sql, @RequestParam(value = "sqlName") String sqlName) {

        Integer userId = SessionUtils.getUserId(request);

        VirtualTables virtualTables = null;
        SysUserDetails sysUser = SessionUtils.getUser(request);
        QueryWrapper queryWrapper = new QueryWrapper();
        queryWrapper.eq("NAME", sqlName);


        if (id != null) {
            virtualTables = virtualTablesService.getById(id);
        } else {
            VirtualTables virtualTable = virtualTablesService.getOne(queryWrapper);
            if (virtualTable != null) {
                return new Result(ResultEnum.EXIST, "名称已存在，请使用其他名称");
            } else {
                virtualTables = new VirtualTables();
                virtualTables.setCreateDate(LocalDateTime.now());
                virtualTables.setCreatorId(sysUser.getId());
                virtualTables.setCreatorName(sysUser.getNickname());
            }
        }
        virtualTables.setCode(sql);
        virtualTables.setOperationTime(LocalDateTime.now());
        virtualTables.setOperationId(sysUser.getId());
        virtualTables.setName(sqlName);
        if (virtualTablesService.saveOrUpdate(virtualTables)) {


            //将本角色下用户创建的信息，保存至中间表中，方便本角色下所有的用户访问
            List<Long> roleIdList = userRoleService.findByRoleIdList(Long.valueOf(SessionUtils.getUserId(request)));
            List<SysRoleVirtualTables> list = new ArrayList<>(SessionUtils.getUserId(request));
            for (Long roleId : roleIdList) {
                SysRoleVirtualTables sysRoleRealDb = new SysRoleVirtualTables();
                sysRoleRealDb.setVirtualId(virtualTables.getId());
                sysRoleRealDb.setRoleId(roleId.intValue());
                list.add(sysRoleRealDb);
            }
            //System.out.println("list》》》》》》"+list);
            roleVirtualService.saveBatch((Collection<SysRoleVirtualTables>) list);

            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }


    /**
     * 下载文件
     *
     * @param response
     * @param sqlName
     * @return
     */
    @RequestMapping("/download/{sqlName}")
    @ResponseBody
    public Result downloadFile(HttpServletResponse response, @PathVariable("sqlName") String sqlName) {
        String fileName = "upload/files/" + sqlName + ".csv";
        File file = new File(fileName);
        if (!file.exists()) {
            return new Result(ResultEnum.EXIST, "文件不存在,请查询之后下载");
        }

        response.reset();
        response.setHeader("Content-Disposition", "attachment;fileName=" + fileName);

        try {
            InputStream inStream = new FileInputStream(fileName);
            OutputStream os = response.getOutputStream();

            byte[] buff = new byte[1024 * 1024];
            int len = -1;
            while ((len = inStream.read(buff)) > 0) {
                os.write(buff, 0, len);
            }
            os.flush();
            os.close();

            inStream.close();
        } catch (Exception e) {
            e.printStackTrace();
            return new Result(ResultEnum.EXIST, "下载失败");
        }
        return new Result<String>(ResultEnum.SECCUSS);
    }

}