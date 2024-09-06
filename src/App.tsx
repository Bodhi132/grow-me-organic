import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { BiChevronDown } from 'react-icons/bi';
import './App.css';

interface ITableData {
  id: number;
  title: String;
  place_of_origin: String;
  artist_display: String;
  inscriptions: String;
  date_start: String;
  date_end: String;
}

function App() {
  const op = useRef(null);

  const [tableData, setTableData] = useState<ITableData[]>([]);
  const [selectedTableData, setSelectedTableData] = useState<ITableData[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(0);
  const [actualPage, setActualPage] = useState(0);
  const [selectrows, setSelectRows] = useState<number>(0);
  const [deselected, setDeselected] = useState<{ [key: number]: number[] }>({});

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setActualPage((event.first / 12) + 1);
    setPage(event.first);
    handleFetch();
  };

  const modifyData = (data: { data: ITableData[] }) => {
    return data.data.reduce((acc: ITableData[], obj: ITableData) => {
      const modifiedObj: ITableData = {
        id: obj.id,
        title: obj.title,
        place_of_origin: obj.place_of_origin,
        artist_display: obj.artist_display,
        inscriptions: obj.inscriptions,
        date_start: obj.date_start,
        date_end: obj.date_end,
      };
      acc.push(modifiedObj);
      return acc;
    }, []);
  };

  const handleFetch = async () => {
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${actualPage}`);
      const data = await response.json();
      setTotalData(data.pagination.total);
      const modifiedData = modifyData(data);
      setTableData(modifiedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    handleFetch();
    localStorage.clear();
  }, []);

  useEffect(() => {
    handleSelectRows(selectrows);
  }, [tableData, page]);

  const handleSelectRows = (rows: number) => {
    const rowsPerPage = 12;

    if (rows > 0) {
      const rhs = rows - rowsPerPage * (actualPage - 1);
      let slicedRows = tableData.slice(0, rhs > 0 ? rhs : rows);

      if (deselected[actualPage]?.length > 0) {
        slicedRows = slicedRows.filter(
          (_, index) => !deselected[actualPage].includes(index)
        );
      }

      setSelectedTableData(slicedRows);
      console.log('selectedTableData', page, rhs, slicedRows);
    } else {
      setSelectedTableData([]);
    }
  };

  const handleUnselect = (e: any) => {
    const index = tableData.findIndex((row) => row.id === e.data.id);
    setDeselected((prevDeselected) => {
      const newDeselected = { ...prevDeselected };
      if (!newDeselected[actualPage]) {
        newDeselected[actualPage] = [];
      }
      newDeselected[actualPage].push(index);
      return newDeselected;
    });
    setSelectedTableData(selectedTableData.filter((data) => data.id !== e.data.id));
  };
  
  const handleOnSelect = (e: any) => {
    setSelectedTableData([...selectedTableData, e.data]);
    const index = tableData.findIndex((row) => row.id === e.data.id);
    if (deselected[actualPage]?.includes(index)) {
      setDeselected((prevDeselected) => {
        const newDeselected = { ...prevDeselected };
        newDeselected[actualPage] = newDeselected[actualPage].filter((i) => i !== index);
        return newDeselected;
      });
    }
  };

  return (
    <>
      <div className="card">
        <DataTable
          value={tableData}
          selectionMode={'checkbox'}
          selection={selectedTableData}
          dataKey="id"
          tableStyle={{ minWidth: '50rem' }}
          onRowUnselect={handleUnselect}
          onRowSelect={handleOnSelect}
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
          <Column field='dropdown' header={
            <>
              <Button onClick={(e) => {
                (op.current as OverlayPanel | null)?.toggle(e);
              }}>
                <BiChevronDown />
              </Button>
              <OverlayPanel ref={op}>
                <InputNumber inputId="integeronly" value={selectrows} onValueChange={(e: InputNumberValueChangeEvent) => setSelectRows(e.value ?? 0)} placeholder='Select rows...' className='block mb-3' />
                <Button className='block ml-auto' onClick={() => handleSelectRows(selectrows || 0)}>Submit</Button>
              </OverlayPanel>
            </>
          }>
          </Column>
          <Column field="title" header="Title"></Column>
          <Column field="place_of_origin" header="Origin"></Column>
          <Column field="artist_display" header="Display"></Column>
          <Column field="inscriptions" header="Inscriptions"></Column>
          <Column field="date_start" header="Start"></Column>
          <Column field="date_end" header="End"></Column>
        </DataTable>
        <Paginator first={page} rows={tableData.length} totalRecords={totalData} onPageChange={onPageChange} />
      </div>
    </>
  );
}

export default App;