import { useState } from "react";

function LeftSide() {
  const menuItems = [
    { path: "/", name: "Tổng quan", icon: <HomeIcon /> },
    { path: "/booking", name: "Đặt vé", icon: <PlaneIcon /> },
    { path: "/my-trips", name: "Chuyến bay của tôi", icon: <SuitcaseIcon /> },
    { path: "/wallet", name: "Ví & Ưu đãi", icon: <WalletIcon /> },
    { path: "/setting", name: "Cài đặt", icon: <Setting /> },
    { path: "/support", name: "Hỗ trợ và tư vấn", icon: <Support /> },
  ];
  return (
    <aside className="side-bar">
      <div className="logo-brand">
        {/*Chỗ này thiết kế để logo và tên thương hiệu vào*/}
      </div>

      <nav>
        {menuItems.map((item) => (
          <NavLink to={item.path} key={item.name} className="menu-item">
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
