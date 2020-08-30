package com.redoop.science.controller;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.redoop.science.entity.SysUser;
import com.redoop.science.service.ISysUserRoleService;
import com.redoop.science.service.ISysUserService;
import com.redoop.science.utils.Result;
import com.redoop.science.utils.ResultEnum;
import com.redoop.science.utils.SessionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import org.springframework.stereotype.Controller;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

/**
 * <p>
 *  前端控制器
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
@Controller
@RequestMapping("/user")
public class SysUserController {

    @Autowired
    private ISysUserService sysUserService;

    @Autowired
    private ISysUserRoleService userRoleService;


    @GetMapping("/tologin")
    public ModelAndView login(ModelAndView modelAndViewm){

        return new ModelAndView("/login");
    }

   @PostMapping("/login")
   @ResponseBody
    public Result<String> login( @RequestParam(name = "username")String username,
                              @RequestParam(name = "password")String password, HttpServletRequest request){
        String usernameTrim = username.trim();
        String passwordTrim = password.trim();

        QueryWrapper<SysUser> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("USERNAME",usernameTrim);
        SysUser user = sysUserService.getOne(queryWrapper);
        if(user==null){
            return new Result<String>(ResultEnum.NOT_NULL);
        }else if(passwordTrim.equals(user.getPassword())){
//            SessionUtils.setUser(request,user);
            return new Result<String>(ResultEnum.SECCUSS);
        }else {
            return new Result<String>(ResultEnum.FAIL_PASSWORD);
        }
    }

    /**
     * 注销
     * @param request
     * @param response
     * @return
     */
    @RequestMapping(value="/logout", method = RequestMethod.GET)
    public String logoutPage (HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null){
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }
        return "redirect:/login";
    }


     /**
     * 数据源列表分类
     * @param model
     * @return
     */
    @GetMapping
    public String index(Model model){
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        List<SysUser> list = sysUserService.list(wrapper);
        model.addAttribute("list", list);
        return "";
    }

    @PostMapping("/save")
    public Result<String> save(SysUser sysUser){
        if (sysUserService.save(sysUser)){
            return new Result<String>(ResultEnum.SECCUSS);
        }else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }
    @PostMapping("/update")
    public Result<String> update(SysUser sysUser){
        if (sysUserService.updateById(sysUser)){
            return new Result<String>(ResultEnum.SECCUSS);
        }else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }
    @PostMapping("/delete")
    public Result<String> delete(Long id){
        if (sysUserService.removeById(id)){
            return new Result<String>(ResultEnum.SECCUSS);
        }else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }



}
