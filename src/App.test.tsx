// @vitest-environment jsdom
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,within} from '@testing-library/react';
import App from './App';
import en from '../locales/en.json';
import zh from '../locales/zh-CN.json';
vi.mock('recharts',()=>({ResponsiveContainer:()=>null,AreaChart:()=>null,Area:()=>null,BarChart:()=>null,Bar:()=>null,Cell:()=>null,XAxis:()=>null,YAxis:()=>null,Tooltip:()=>null,CartesianGrid:()=>null}));
beforeEach(()=>localStorage.clear());
afterEach(cleanup);
describe('China intelligence workflows',()=>{
 it('keeps both locale dictionaries complete',()=>{expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort());});
 it('switches the full interface and searches across languages and material aliases',()=>{
  render(<App/>);expect(screen.getByRole('heading',{name:zh.greeting})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'English'}));
  expect(screen.getByRole('heading',{name:en.greeting})).toBeTruthy();
  fireEvent.change(screen.getByRole('textbox'),{target:{value:'上海'}});
  expect(screen.getByRole('button',{name:/^Shanghai Metro Tunnel Project/})).toBeTruthy();
  expect(screen.queryByRole('button',{name:/^Shenzhen Airport Expansion/})).toBeNull();
  fireEvent.change(screen.getByRole('textbox'),{target:{value:'锚杆'}});
  expect(screen.getByRole('button',{name:/^Shanghai Metro Tunnel Project/})).toBeTruthy();
  expect(screen.getByRole('button',{name:/^Shanxi Mining Support Project/})).toBeTruthy();
  fireEvent.change(screen.getByRole('textbox'),{target:{value:'not-a-project'}});
  expect(screen.getByRole('heading',{name:en.noResults})).toBeTruthy();
 });
 it('filters, saves a project and persists human review',()=>{
  localStorage.setItem('op-language',JSON.stringify('en'));render(<App/>);
  fireEvent.change(screen.getByRole('combobox',{name:en.location}),{target:{value:'shanghai'}});
  fireEvent.click(screen.getByRole('button',{name:/Save project Shanghai Metro/}));
  expect(JSON.parse(localStorage.getItem('op-saved')!)).toEqual(['CN-2026-002']);
  fireEvent.click(screen.getByRole('button',{name:/^Shanghai Metro Tunnel Project/}));
  const dialog=screen.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('tab',{name:en.requirements}));
  expect(within(dialog).getByText(en.missingBody)).toBeTruthy();
  fireEvent.click(within(dialog).getByRole('button',{name:en.markReviewed}));
  expect(JSON.parse(localStorage.getItem('op-reviewed')!)).toEqual(['CN-2026-002']);
  fireEvent.keyDown(document,{key:'Escape'});expect(screen.queryByRole('dialog')).toBeNull();
 });
 it('creates a bilingual briefing including risks, product matches and export options',()=>{
  localStorage.setItem('op-language',JSON.stringify('en'));render(<App/>);
  fireEvent.click(screen.getByRole('button',{name:en.generate}));
  fireEvent.click(screen.getByRole('button',{name:en.bilingualReport}));
  fireEvent.click(screen.getByRole('button',{name:en.createReport}));
  expect(screen.getByRole('heading',{name:zh.reportTitle})).toBeTruthy();
  expect(screen.getByText(zh.executiveBody)).toBeTruthy();expect(screen.getByText(en.executiveBody)).toBeTruthy();
  expect(screen.getByText(en.missingBody,{exact:false})).toBeTruthy();
  expect(screen.getByRole('button',{name:en.excel})).toBeTruthy();
  expect(screen.getByRole('button',{name:en.pdf})).toBeTruthy();
  expect(screen.getByRole('button',{name:en.email})).toBeTruthy();
 });
});
