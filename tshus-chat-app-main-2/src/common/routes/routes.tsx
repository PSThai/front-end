import Main from '@/common/layout';
import Chat from '@/client/pages/chat';
import Phonebook from '@/client/pages/phonebook';
import { AddressBook, PresentationChart, WechatLogo } from '@phosphor-icons/react';
import { RouteType } from '@/common/types/route/route.type';
import Dashboard from '@/admin/pages/dashboard';


// Client route
const publicClientRoutes: RouteType[] = [
  {
    name: 'Trò chuyện',
    path: '',
    component: Chat,
    layout: Main,
    icon: WechatLogo,
  },
  {
    name: 'Bạn bè',
    path: 'phonebook',
    component: Phonebook,
    layout: Main,
    icon: AddressBook,
  }
];

const privateClientRoute: any = [];

// Admin route
const adminRoute: RouteType[] = [
  {
    name: 'Thống kê',
    path: 'dashboard',
    component: Dashboard,
    layout: Main,
    icon: PresentationChart,
  },
];

export { publicClientRoutes, privateClientRoute, adminRoute };
