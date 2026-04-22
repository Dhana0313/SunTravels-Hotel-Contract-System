import { Routes } from '@angular/router';
import { ContractManagement } from './features/contract-management/contract-management';
import { ContractViewer } from './features/contract-viewer/contract-viewer';
import { SearchEngine } from './features/search-engine/search-engine';

export const routes: Routes = [
  { path: 'search', component: SearchEngine },
  { path: 'add-contract', component: ContractManagement },
  { path: 'view-contracts', component: ContractViewer },
  { path: '', redirectTo: '/search', pathMatch: 'full' } // Default landing page
];
