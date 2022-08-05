/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable camelcase */
/* eslint-disable new-cap */
import {
	Avatar, Box, Button, Card, Checkbox, Container, Stack, Table, TableBody,
	TableCell, TableContainer,
	TablePagination, TableRow, Typography
} from '@mui/material';
import axios from 'axios';
import { filter } from 'lodash';
import mqtt from "precompiled-mqtt";
import { useEffect, useState } from 'react';
import { Alert } from 'reactstrap';

import Iconify from '../components/Iconify';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../sections/@dashboard/user';

// ----------------------------------------------------------------------
const SERVER_URL = 'https://10.58.2.34:3503/performance';
const SERVER_URL_STARTDATE = 'https://10.58.2.34:3503/performance/startdate';
const MQTT_BROKER_URL = 'ws://3.34.7.143:8888';
const MQTT_TOPIC_ADMIN_ALARM = 'topic-admin-alarm';

const TABLE_HEAD = [
	{ id: 'id', label: 'User ID', alignRight: false },
	{ id: 'number_total_query', label: '#Queries', alignRight: false },
	{ id: 'number_exact_match', label: '#Exact match', alignRight: false },
	{ id: 'number_partial_match', label: '#Partial match', alignRight: false },
	{ id: 'number_no_match', label: '#No match', alignRight: false },
	{ id: 'avgNumberOfQueriesPerSec', label: "Avg #Query(sec)", alignRight: false },
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
	const [userlist, setUserlist] = useState(undefined);
	const [serverStarttime, setServerstarttime] = useState(undefined);
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

	const [msg, setMsg] = useState(undefined);

	useEffect(() => {
		const today = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
		setLastUpdated(today);

		requestToServerStarttime();
		// requestToPerformanceMetric();

		const mqttClient = mqtt.connect(MQTT_BROKER_URL);
		mqttClient.on('connect', () => {
			console.log("MQTT Connected.");
			mqttClient.subscribe(MQTT_TOPIC_ADMIN_ALARM);
		});
		mqttClient.on('message', (topic, payload) => {
			const s = payload.toString();
			setMsg(s);
		});
	}, []);

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

	const requestToPerformanceMetric = async () => {
		console.log("requestToPerformanceMetric");
		axios
			.get(SERVER_URL)
			.then(response => {
				console.log(response);
				const data = response.data;
				const total = {
					id: "TOTAL",
					number_total_query: 0,
					number_exact_match: 0,
					number_partial_match: 0,
					number_no_match: 0
				};
				data.forEach((d) => {
					total.number_total_query += d.number_total_query;
					total.number_exact_match += d.number_exact_match;
					total.number_partial_match += d.number_partial_match;
					total.number_no_match += d.number_no_match;
				});
				data.unshift(total);
				setUserlist(data);
			})
			.catch(err => {
				console.log('err', err);
			});
	}

	const requestToServerStarttime = async () => {
		console.log("requestToServerStarttime");
		axios
			.get(SERVER_URL_STARTDATE)
			.then(response => {
				console.log(response);
				const serverStartTime = response.data;

				setServerstarttime(serverStartTime);
				//
				let serverDuration = new Date().getTime();
				serverDuration -= serverStartTime;
				serverDuration /= 1000;

				console.log("requestToPerformanceMetric");
				axios
					.get(SERVER_URL)
					.then(response => {
						console.log(response);
						const data = response.data;
						const total = {
							id: "TOTAL",
							number_total_query: 0,
							number_exact_match: 0,
							number_partial_match: 0,
							number_no_match: 0,
							avgNumberOfQueriesPerSec: 0.0
						};
						data.forEach((d) => {
							total.number_total_query += d.number_total_query;
							total.number_exact_match += d.number_exact_match;
							total.number_partial_match += d.number_partial_match;
							total.number_no_match += d.number_no_match;
							total.avgNumberOfQueriesPerSec = (total.number_total_query / serverDuration);
							d.avgNumberOfQueriesPerSec = (d.number_total_query / serverDuration);

						});
						data.unshift(total);
						setUserlist(data);
					})
					.catch(err => {
						console.log('err', err);
					});
				//
			})
			.catch(err => {
				console.log('err', err);
			});
	}

	return (<>
		{userlist &&
			<>
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
												// const { id, numTotalQuery, numExactMatch, numPartialMatch, numNoMatch } = row;
												const { id, number_total_query, number_exact_match, number_partial_match, number_no_match, avgNumberOfQueriesPerSec } = row;
												const convertNumber = Number(avgNumberOfQueriesPerSec).toFixed(4);

												const isItemSelected = selected.indexOf(id) !== -1;
												const bcolor = (index === 0 ? 'red' : 'black');
												const backColor = (index === 0 ? '#fff9a8' : 'white');
												return (
													<TableRow
														hover
														key={id}
														tabIndex={-1}
														role="checkbox"
														selected={isItemSelected}
														aria-checked={isItemSelected}
														style={{ backgroundColor: backColor }}
													>
														<TableCell padding="checkbox">
															<Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, id)} />
														</TableCell>
														<TableCell component="th" scope="row" padding="none">
															<Stack direction="row" alignItems="center" spacing={2}>
																<Avatar alt={id} src={`/static/mock-images/avatars/avatar_${index + 1}.jpg`} />
																<Typography variant="subtitle2" noWrap color={bcolor}>
																	{id}
																</Typography>
															</Stack>
														</TableCell>
														{/* <TableCell align="left">{numTotalQuery}</TableCell>
													<TableCell align="left">{numExactMatch}</TableCell>
													<TableCell align="left">{numPartialMatch}</TableCell>
													<TableCell align="left">{numNoMatch}</TableCell> */}
														<TableCell align="left" style={{ color: bcolor }}>{number_total_query}</TableCell>
														<TableCell align="left" style={{ color: bcolor }}>{number_exact_match}</TableCell>
														<TableCell align="left" style={{ color: bcolor }}>{number_partial_match}</TableCell>
														<TableCell align="left" style={{ color: bcolor }}>{number_no_match}</TableCell>
														<TableCell align="left" style={{ color: bcolor }}>{convertNumber}</TableCell>
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
				{msg && <div style={{ position: 'fixed', top: 10 }}>
					<Alert color='danger'>{msg}</Alert>
				</div>
				}
			</>}
	</>);
}
