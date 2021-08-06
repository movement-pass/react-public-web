import dayjs from 'dayjs';
import debounce from 'lodash.debounce';

import { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';

import Districts from '../data/locations.json';
import Types from '../data/types';

import api from '../api';

import { LocalizationContext } from '../contexts/localization';

import Spinner from '../components/Spinner';

const Styles = makeStyles((theme) => ({
  table: {
    marginTop: theme.spacing(3),
    maxHeight: 750,
    '& tbody tr': {
      cursor: 'pointer'
    }
  },
  centerColumn: {
    textAlign: 'center'
  },
  emptyRow: {
    cursor: 'inherit !important'
  }
}));

function List() {
  const styles = Styles();

  const [sortColumn, setSortColumn] = useState('endAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [list, setList] = useState(null);
  const [startKey, setStartKey] = useState(null);
  const table = useRef();
  const culture = useContext(LocalizationContext);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const { passes, nextKey } = await api.getPasses();
      setList(passes);
      setStartKey(nextKey);
    })();
  }, []);

  const sort = (target, column, direction) => {
    const sorted = target.sort((x, y) => {
      if (x[column] === y[column]) {
        return 0;
      }

      if (direction === 'desc') {
        return y[column] > x[column] ? 1 : -1;
      }

      return x[column] > y[column] ? 1 : -1;
    });

    setList(sorted);
  };

  const handleSort = (column) => () => {
    const localDirection =
      column === sortColumn && sortDirection === 'asc' ? 'desc' : 'asc';

    setSortColumn(column);
    setSortDirection(localDirection);
    sort(list, column, localDirection);
  };

  const handleScroll = debounce((e) => {
    const [rowHeight, noOfRows] = [72, 3];

    if (!startKey) {
      return;
    }

    const { target } = e;

    if (!target) {
      return;
    }

    // noinspection JSUnresolvedVariable
    if (
      target.scrollTop + target.offsetHeight + rowHeight * noOfRows <=
      table.current.offsetHeight
    ) {
      return;
    }

    (async () => {
      const { passes, nextKey } = await api.getPasses(startKey);
      const updatedList = [...list, ...passes];
      sort(updatedList, sortColumn, sortDirection);
      setStartKey(nextKey);
    })();
  }, 400);

  const handleRowClick = (pass) => history.push(`/passes/${pass.id}`);

  const thanaName = (district, thana) => {
    const match = Districts.find((d) => d.id === district).thanas.find(
      (t) => t.id === thana
    );

    return match[culture];
  };

  const typeName = (type) => Types[type][culture];

  return (
    <>
      {list ? (
        <Card>
          <CardContent>
            <Typography variant="h6" component="h2">
              Passes
            </Typography>
            <TableContainer className={styles.table} onScroll={handleScroll}>
              <Table ref={table} stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortColumn === 'toLocation'}
                        direction={sortDirection}
                        onClick={handleSort('toLocation')}
                      >
                        Location
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortColumn === 'thana'}
                        direction={sortDirection}
                        onClick={handleSort('thana')}
                      >
                        Thana
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortColumn === 'startAt'}
                        direction={sortDirection}
                        onClick={handleSort('startAt')}
                      >
                        Start at
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortColumn === 'endAt'}
                        direction={sortDirection}
                        onClick={handleSort('endAt')}
                      >
                        End at
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortColumn === 'type'}
                        direction={sortDirection}
                        onClick={handleSort('type')}
                      >
                        Type
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortColumn === 'status'}
                        direction={sortDirection}
                        onClick={handleSort('status')}
                      >
                        Status
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      onClick={() => handleRowClick(item)}
                    >
                      <TableCell>{item.toLocation}</TableCell>
                      <TableCell>
                        {thanaName(item.district, item.thana)}
                      </TableCell>
                      <TableCell>
                        {dayjs(item.startAt).format('MMMM D, h:mm a')}
                      </TableCell>
                      <TableCell>
                        {dayjs(item.endAt).format('MMMM D, h:mm a')}
                      </TableCell>
                      <TableCell>{typeName(item.type)}</TableCell>
                      <TableCell>{item.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        <Spinner />
      )}
    </>
  );
}

export default List;
