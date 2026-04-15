import React, { useState } from 'react'
import { StyledTableCell, StyledTableRow } from './styles';
import { Table, TableBody, TableContainer, TableHead, TablePagination } from '@mui/material';

const TableTemplate = ({ buttonHaver: ButtonHaver, columns = [], rows = [] }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    return (
        <>
            <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <StyledTableRow>
                            {columns.map((column) => (
                                <StyledTableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </StyledTableCell>
                            ))}
                            <StyledTableCell align="center">
                                Actions
                            </StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                  <TableBody>
  {Array.isArray(rows) && rows.length > 0 ? (
    rows
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((row, index) => {
        return (
          <StyledTableRow
            hover
            role="checkbox"
            tabIndex={-1}
            key={row.id || index}
          >
            {columns.map((column) => {
              const value = row[column.id];

              return (
                <StyledTableCell key={column.id} align={column.align}>
                  {column.format && typeof value === 'number'
                    ? column.format(value)
                    : value || "-"}
                </StyledTableCell>
              );
            })}

            <StyledTableCell align="center">
              {ButtonHaver ? <ButtonHaver row={row} /> : null}
            </StyledTableCell>
          </StyledTableRow>
        );
      })
  ) : (
    <StyledTableRow>
      <StyledTableCell colSpan={columns.length + 1} align="center">
        No Data Available
      </StyledTableCell>
    </StyledTableRow>
  )}
</TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 5));
                    setPage(0);
                }}
            />
        </>
    )
}

export default TableTemplate