import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { BiChevronDown } from 'react-icons/bi';
import { useLocalStorage } from 'primereact/hooks';
import './App.css'

interface ITableData {
  id: number
  title: String,
  place_of_origin: String,
  artist_display: String,
  inscriptions: String,
  date_start: String,
  date_end: String
}

function App() {

  const op = useRef(null);

  const [tableData, setTableData] = useState<ITableData[]>([])
  const [selectedTableData, setSelectedTableData] = useState<ITableData[]>([]);
  // const [deselectedRows, setDeselectedRows] = useState<ITableData[]>([]);
  const [totalData, setTotalData] = useState(0)
  const [page, setPage] = useState(0);
  const [actualPage, setActualPage] = useState(0);
  const [selectrows, setSelectRows] = useState<number>(0)
  const [change, setChange] = useState(false)

  const [deselected, setDeselected] = useLocalStorage<number[]>([], 'deselected')

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setActualPage((event.first / 12) + 1);
    setPage(event.first);
    handleFetch()
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
        date_end: obj.date_end
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
    console.log(page);
    handleFetch();
    window.onload = () => {
      localStorage.clear();
    };
  }, [])

  // useEffect(() => {
  //   // onUnselect();
  //   handleFetch();
  // }, [page]);

  // useEffect(() => {
  //   onUnselect()
  // }, [selectedTableData])

  // useEffect(() => {
  //   if(change === false) {
  //     if (tableData.length > 0 && deselected.length > 0) {
  //       const filteredRows = tableData.filter(
  //         (_, index) => !deselected.includes(index)
  //       );
  //       setSelectedTableData(filteredRows);
  //     }
  //   }
  // }, [tableData, deselected,page,change]);


  useEffect(() => {
    handleSelectRows(selectrows);
  }, [tableData, page]);


  // const handleSelectRows = (rows: number) => {

  //   const rowsPerPage = 12;

  //   if (rows > 0) {
  //     if (page > 0 && rows > rowsPerPage) {
  //       const rhs = rows - rowsPerPage * (actualPage - 1)
  //       if (rhs > 0 && deselected.length === 0) {
  //         setSelectedTableData(tableData.slice(0, rhs));
  //         console.log('selectedTableData',page,rhs);
          
  //       }
  //       if(rhs > 0 && deselected.length > 0)
  //       {
  //         console.log('next');
          
  //         if(deselected.length > 0)
  //         {
  //           let filteredRows = tableData.filter(
  //             (_, index) => !deselected.includes(index)
  //           );
  //           filteredRows = filteredRows.slice(0, rhs);
  //           console.log(filteredRows);
            
  //           setSelectedTableData(filteredRows);
  //         }
  //       }
  //     }}
  //     if (page === 0 && rows > rowsPerPage) {

  //       if(deselected.length > 0 )
  //         {
  //           let filteredRows = tableData.filter(
  //             (_, index) => !deselected.includes(index)
  //           );
  //           filteredRows = filteredRows.slice(0, rows);
  //           setSelectedTableData(filteredRows);
  //         }
  //       setSelectedTableData(tableData.slice(0, rows));
  //     }
    
  //   else {

  //     setSelectedTableData([]);
  //   }
  // }

  const handleSelectRows = (rows: number) => {
    const rowsPerPage = 12;
  
    if (rows > 0) {
      const rhs = rows - rowsPerPage * (actualPage - 1);
      let filteredRows = tableData;
  
      if (rhs > 0) {
        filteredRows = filteredRows.slice(0, rhs);
        if(deselected.length > 0) {
          filteredRows = filteredRows.filter(
            (_, index) => !deselected.includes(index)
          );
        }
      } else {
        filteredRows = filteredRows.slice(0, rows);
        if(deselected.length > 0) {
          filteredRows = filteredRows.filter(
            (_, index) => !deselected.includes(index)
          );
        }
      }
  
      setSelectedTableData(filteredRows);
      console.log('selectedTableData', page, rhs, filteredRows);
    } else {
      setSelectedTableData([]);
    }
  };

  // const handleSelectionChange = (e: any) => {
  //   const selectedRows = e.value;


  //   setSelectedTableData(selectedRows)


  //   // const deselectedRowIndices = tableData
  //   // .map((row, index) => ({ row, index }))
  //   // .filter(({ row }) => !selectedRows.some((selectedRow: ITableData) => selectedRow.id === row.id))
  //   // .map(({ index }) => index);

  //   // setDeselected(deselectedRowIndices);



  // };

  // const handleNotSelect = (selectedTableData: ITableData[]) => {




  //   const data = [...selectedTableData];

  //   deselected.forEach((index) => {
  //     data.splice(index, 1);
  //   })

  //   setSelectedTableData(data);

  // }

  const handleUnselect = (e: any) => {
    setChange(false);
    const index = tableData.findIndex((row) => row.id === e.data.id);
    setDeselected((prevDeselected) => {
      const newDeselected = new Set(prevDeselected);
      newDeselected.add(index);
      return Array.from(newDeselected);
    });
    setSelectedTableData(selectedTableData.filter((data) => data.id !== e.data.id));
  }

  // const handleSelect = (e: any) => {
  //   const newDeSelectedData = deselected.filter((data) => data.id !== e.data.id);
  //   setDeselected(newDeSelectedData);
  // }

  // const onUnselect = () => {
  //   if (deselected.length > 0 && selectedTableData.length > 0) {
  //     deselected.forEach((index) => {
  //       selectedTableData.splice(index, 1);
  //     })

  //     setSelectedTableData(selectedTableData);
  //   }
  // }



  const handleOnSelect = (e: any) => {

    setChange(true);
    setSelectedTableData([...selectedTableData, e.data]);
    const index = tableData.findIndex((row) => row.id === e.data.id);
    if (deselected.includes(index)) {
      setDeselected((prevDeselected) => {
        const newDeselected = new Set(prevDeselected);
        newDeselected.delete(index);
        return Array.from(newDeselected);
      });
    }
  }

  return (
    <>
      <div className="card">
        <DataTable
          value={tableData}
          selectionMode={'checkbox'}
          selection={selectedTableData}
          // onSelectionChange={handleSelectionChange}
          dataKey="id"
          tableStyle={{ minWidth: '50rem' }}
          onRowUnselect={handleUnselect}
          onRowSelect={handleOnSelect}
        // virtualScrollerOptions={{ lazy: true, loadingTemplate: loadingTemplate }}
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
  )
}

export default App
