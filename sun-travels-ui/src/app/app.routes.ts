import { Routes } from '@angular/router';
import { ContractManagement } from './features/contract-management/contract-management';
import { ContractViewer } from './features/contract-viewer/contract-viewer';
import { SearchEngine } from './features/search-engine/search-engine';
import { HotelManagementComponent } from './features/hotel-management/hotel-management';

export const routes: Routes = [
  { path: 'search', component: SearchEngine },
  { path: 'add-contract', component: ContractManagement },
  { path: 'view-contracts', component: ContractViewer },
  { path: 'manage-hotels', component: HotelManagementComponent },
  { path: '', redirectTo: '/search', pathMatch: 'full' } // Default landing page
];
