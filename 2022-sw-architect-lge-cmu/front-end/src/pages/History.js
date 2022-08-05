/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable camelcase */
import {
	Box, Button, Card, Checkbox, Container, Stack, Table, TableBody,
	TableCell, TableContainer,
	TablePagination, TableRow, Typography
} from '@mui/material';
import { filter } from 'lodash';
import { useContext, useEffect, useState } from 'react';
import Iconify from '../components/Iconify';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { ModelContextStore } from '../model/ModelStore';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../sections/@dashboard/user';

// ----------------------------------------------------------------------

// "plate":"LKY1360",
// "status":"Owner Wanted",
// "registration":"08/22/2023",
// "ownerName":"Jennifer",
// "ownerBirth":"11/11/2011",
// "ownerAddress":"5938",
// "ownerCity":"West",
// "vehicleYear":2014,
// "vehicleMaker":"Chrysler",
// "vehicleModel":"Tucson",
// "vehicleColor":"lime",

const TABLE_HEAD = [
	// { id: 'id', label: 'id', alignRight: false },
	{ id: 'plate', label: 'Plate', alignRight: false },
	{ id: 'status', label: 'Status', alignRight: false },
	{ id: 'registration', label: 'Registration', alignRight: false },
	{ id: 'owner', label: 'Owner', alignRight: false },
	{ id: 'vehicle', label: 'Vehicle', alignRight: false },
	{ id: 'partial', label: 'Partial Match', alignRight: false },
	{ id: '' },
];


// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

function getComparator(order, orderBy) {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
	const stabilizedThis = array.map((el, index) => [el, index]);
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0]);
		if (order !== 0) return order;
		return a[1] - b[1];
	});
	if (query) {
		return filter(array, (_user) => _user.id.toLowerCase().indexOf(query.toLowerCase()) !== -1);
	}
	return stabilizedThis.map((el) => el[0]);
}

export default function Server() {
	const modelContext = useContext(ModelContextStore);
	const [found, setFound] = useState(undefined);

	const [userlist, setUserlist] = useState([]);
	const [page, setPage] = useState(0);
	const [order, setOrder] = useState('asc');
	const [selected, setSelected] = useState([]);
	const [orderBy, setOrderBy] = useState('name');
	const [filterName, setFilterName] = useState('');
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const [emptyRows, setEmptyRows] = useState(0);
	const [filteredUsers, setFilteredUsers] = useState(undefined);
	const [isUserNotFound, setIsUserNotFound] = useState(false);

	const [lastUpdated, setLastUpdated] = useState(undefined);

	useEffect(() => {
		const today = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
		setLastUpdated(today);
	}, []);

	useEffect(() => {
		if (modelContext.cache === undefined) {
			return;
		}
		console.log("modelContext.cache", modelContext.cache);
		try {
			modelContext.cache.forEach((platesFound) => {
				const m = platesFound[0];
				console.log(m);
				if (m !== undefined) {

					// "plate":"LKY1360",
					// "status":"Owner Wanted",
					// "registration":"08/22/2023",
					// "ownerName":"Jennifer",
					// "ownerBirth":"11/11/2011",
					// "ownerAddress":"5938",
					// "ownerCity":"West",
					// "vehicleYear":2014,
					// "vehicleMaker":"Chrysler",
					// "vehicleModel":"Tucson",
					// "vehicleColor":"lime",

					const revised = {
						id: m.id,
						plate: m.plate,
						status: m.status,
						registration: m.registration,
						owner: m.ownerName,
						vehicle: m.vehicleModel,
						partial: platesFound.length > 1 ? 'Partial' : 'Exact'
					}

					const ul = userlist;
					ul.push(revised);
					console.log("revised", revised, "total", ul);
					setUserlist(ul);
				}
			});
		} catch (err) {
			console.error(err);
		}
	}, [modelContext.cache]);

	useEffect(() => {
		const refresh = () => {
			setEmptyRows(page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userlist.length) : 0);
			const filtered = applySortFilter(userlist, getComparator(order, orderBy), filterName);
			setFilteredUsers(filtered);
			setIsUserNotFound(filtered.length === 0);
		}

		if (userlist) {
			refresh();
		}
	}, [userlist]);

	const handleRequestSort = (event, property) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleSelectAllClick = (event) => {
		if (event.target.checked) {
			const newSelecteds = userlist.map((n) => n.id);
			setSelected(newSelecteds);
			return;
		}
		setSelected([]);
	};

	const handleClick = (event, name) => {
		const selectedIndex = selected.indexOf(name);
		let newSelected = [];
		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, name);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
		}
		setSelected(newSelected);
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleFilterByName = (event) => {
		setFilterName(event.target.value);
	};

	return (<>
		{userlist &&
			<Page title="Server">

				<Container>
					<Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
						<Typography variant="h4" gutterBottom>
							Performance Metric
						</Typography>
					</Stack>

					<Card>
						<UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

						<Scrollbar>
							<Box sx={{ p: 1, textAlign: 'right' }}>
								<p style={{ margin: '1em', fontSize: '0.8em' }}>Last updated: {lastUpdated} (for 30 mins)</p>
								<Button size="small" color="inherit"
									onClick={() => window.location.reload()}
									endIcon={<Iconify icon={'el:refresh'} />}>
									Refresh
								</Button>
							</Box>

							<TableContainer sx={{ minWidth: 800 }}>
								<Table>
									<UserListHead
										order={order}
										orderBy={orderBy}
										headLabel={TABLE_HEAD}
										rowCount={userlist.length}
										numSelected={selected.length}
										onRequestSort={handleRequestSort}
										onSelectAllClick={handleSelectAllClick}
									/>
									<TableBody>
										{filteredUsers && filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
											// "plate":"LKY1360",
											// "status":"Owner Wanted",
											// "registration":"08/22/2023",
											// "ownerName":"Jennifer",
											// "ownerBirth":"11/11/2011",
											// "ownerAddress":"5938",
											// "ownerCity":"West",
											// "vehicleYear":2014,
											// "vehicleMaker":"Chrysler",
											// "vehicleModel":"Tucson",
											// "vehicleColor":"lime",
											const { id, plate, status, registration, owner, vehicle, partial } = row;

											const isItemSelected = selected.indexOf(id) !== -1;
											return (
												<TableRow
													hover
													key={id}
													tabIndex={-1}
													role="checkbox"
													selected={isItemSelected}
													aria-checked={isItemSelected}
												>
													<TableCell padding="checkbox">
														<Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, plate)} />
													</TableCell>
													<TableCell component="th" scope="row" padding="none">
														<Stack direction="row" alignItems="center" spacing={2}>
															{/* <Avatar alt={id} src={`/static/mock-images/avatars/avatar_${index + 1}.jpg`} /> */}
															<Typography variant="subtitle2" noWrap>
																{plate}
															</Typography>
														</Stack>
													</TableCell>
													<TableCell align="left" >{status}</TableCell>
													<TableCell align="left" >{registration}</TableCell>
													<TableCell align="left" >{owner}</TableCell>
													<TableCell align="left" >{vehicle}</TableCell>
													<TableCell align="left" >{partial}</TableCell>
													<TableCell align="right">
														<UserMoreMenu />
													</TableCell>
												</TableRow>
											);
										})}
										{emptyRows > 0 && (
											<TableRow style={{ height: 53 * emptyRows }}>
												<TableCell colSpan={6} />
											</TableRow>
										)}
									</TableBody>

									{isUserNotFound && (
										<TableBody>
											<TableRow>
												<TableCell align="center" colSpan={6} sx={{ py: 3 }}>
													<SearchNotFound searchQuery={filterName} />
												</TableCell>
											</TableRow>
										</TableBody>
									)}
								</Table>
							</TableContainer>
						</Scrollbar>

						<TablePagination
							rowsPerPageOptions={[5, 10, 25]}
							component="div"
							count={userlist.length}
							rowsPerPage={rowsPerPage}
							page={page}
							onPageChange={handleChangePage}
							onRowsPerPageChange={handleChangeRowsPerPage}
						/>
					</Card>
				</Container>
			</Page>
		}
	</>);
}
