import * as yup from 'yup';
import get from 'lodash.get';
import dayjs from 'dayjs';
import DateFnsUtils from '@date-io/dayjs';

import { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useFormik } from 'formik';

import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import Districts from '../data/locations.json';
import Types from '../data/types';
import Reasons from '../data/reasons';

import api from '../api';

import { LocalizationContext } from '../contexts/localization';

const Durations = Array.from({ length: 12 }, (_, n) => n + 1);

const Styles = makeStyles((theme) => ({
  form: {
    marginTop: theme.spacing(3),
    '& a': {
      textDecoration: 'none'
    }
  }
}));

function Apply() {
  const styles = Styles();
  const [thanas, setThanas] = useState([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);
  const culture = useContext(LocalizationContext);
  const history = useHistory();

  const {
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
    touched,
    values
  } = useFormik({
    initialValues: {
      fromLocation: '',
      toLocation: '',
      district: null,
      thana: null,
      dateTime: dayjs().add(4, 'hour').toDate(),
      durationInHour: 1,
      type: 'R',
      reason: '',
      includeVehicle: false,
      vehicleNo: '',
      selfDriven: true,
      driverName: '',
      driverLicenseNo: ''
    },
    validationSchema: yup.object().shape({
      fromLocation: yup.string().label('From location').required().max(64),
      toLocation: yup.string().label('To location').required().max(64),
      district: yup.mixed().label('District').required(),
      thana: yup.mixed().label('Thana').required(),
      dateTime: yup
        .date()
        .label('Date and time')
        .required()
        .nullable()
        .min(dayjs().add(1, 'hour').toDate())
        .max(dayjs().add(1, 'day').toDate()),
      durationInHour: yup
        .number()
        .integer()
        .label('Duration')
        .required()
        .min(1)
        .max(12),
      type: yup.string().label('Type').required(),
      reason: yup.string().label('Reason').required().max(64),
      includeVehicle: yup.boolean().label('Vehicle').required(),
      vehicleNo: yup.string().when('includeVehicle', {
        is: true,
        then: yup.string().label('Vehicle no').required().max(64),
        otherwise: yup.string().label('Vehicle no').optional()
      }),
      selfDriven: yup.boolean().label('Self driven'),
      driverName: yup.string().when('selfDriven', {
        is: false,
        then: yup.string().label('Driver name').required().max(64),
        otherwise: yup.string().label('Driver name').optional()
      }),
      driverLicenseNo: yup.string().when('selfDriven', {
        is: false,
        then: yup.string().label('Driver license no').required().max(64),
        otherwise: yup.string().label('Driver license no').optional()
      })
    }),
    onSubmit: async (fields) => {
      setWorking(true);
      showError(null);

      try {
        const input = {
          ...fields,
          district: fields.district.id,
          thana: fields.thana.id,
          dateTime: dayjs(fields.dateTime).toISOString()
        };

        if (!input.includeVehicle) {
          input.selfDriven = false;
          delete input['vehicleNo'];
          delete input['driverName'];
          delete input['driverLicenseNo'];
        } else {
          if (input.selfDriven) {
            delete input['driverName'];
            delete input['driverLicenseNo'];
          }
        }

        const res = await api.applyPass(input);

        if (!res.errors) {
          return history.push('/passes');
        }

        setError(res.errors[0]);
      } catch (e) {
        setError('An unexpected error has occurred, please try again!');
      } finally {
        setWorking(false);
      }
    }
  });

  const showError = (name) =>
    Boolean(get(errors, name)) && (Boolean(get(touched, name)) || isSubmitting);

  const errorText = (name) => (showError(name) ? get(errors, name) : null);

  const handleDistrictChange = (_, value) => {
    setFieldValue('district', value);
    setFieldValue('thana', null);

    if (value) {
      const district = Districts.find((l) => l.id === value.id);
      setThanas(district.thanas);
    } else {
      setThanas([]);
    }
  };

  const handleThanaChange = (_, value) => setFieldValue('thana', value);

  const handleDateTimeChange = (value) => setFieldValue('dateTime', value);

  const handleReasonChange = (_, value) => setFieldValue('reason', value);

  const handleIncludeVehicleChange = (e) => {
    setFieldValue('includeVehicle', e.target.value);

    if (e.target.value) {
      setFieldValue('selfDriven', true);
    } else {
      setFieldValue('vehicleNo', '');
      setFieldValue('selfDriven', false);
      setFieldValue('driverName', '');
      setFieldValue('driverLicenseNo', '');
    }
  };

  const handleSelfDrivenChange = (e) => {
    setFieldValue('selfDriven', e.target.value);

    if (e.target.value) {
      setFieldValue('driverName', '');
      setFieldValue('driverLicenseNo', '');
    } else {
      setFieldValue('driverName', '');
      setFieldValue('driverLicenseNo', '');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2">
          Apply
        </Typography>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  id="fromLocation"
                  name="fromLocation"
                  label="From location"
                  variant="outlined"
                  value={values.fromLocation}
                  onChange={handleChange}
                  error={showError('fromLocation')}
                  helperText={errorText('fromLocation')}
                  inputProps={{ maxLength: 64 }}
                  fullWidth
                  required
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="toLocation"
                  name="toLocation"
                  label="Location of your destination"
                  variant="outlined"
                  value={values.toLocation}
                  onChange={handleChange}
                  error={showError('toLocation')}
                  helperText={errorText('toLocation')}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  id="district"
                  noOptionsText="No matching district"
                  value={values.district}
                  onChange={handleDistrictChange}
                  options={Districts}
                  getOptionLabel={(opt) => opt[culture]}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="district"
                      label="District of your destination"
                      variant="outlined"
                      error={showError('district')}
                      helperText={errorText('district')}
                      required
                    />
                  )}
                  openOnFocus
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  id="thana"
                  noOptionsText="No matching thana"
                  value={values.thana}
                  onChange={handleThanaChange}
                  options={thanas}
                  getOptionLabel={(opt) => opt[culture]}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="thana"
                      label="Thana of your destination"
                      variant="outlined"
                      error={showError('thana')}
                      helperText={errorText('thana')}
                      required
                    />
                  )}
                  openOnFocus
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  id="dateTime"
                  name="dateTime"
                  label="Date and time"
                  inputVariant="outlined"
                  disablePast={true}
                  minDate={dayjs().toDate()}
                  maxDate={dayjs().add(1, 'day').toDate()}
                  value={values.dateTime}
                  onChange={handleDateTimeChange}
                  error={showError('dateTime')}
                  helperText={errorText('dateTime')}
                  openTo="hours"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="durationInHour"
                  name="durationInHour"
                  label="Duration"
                  variant="outlined"
                  value={values.durationInHour}
                  onChange={handleChange}
                  error={showError('durationInHour')}
                  helperText={errorText('durationInHour')}
                  select
                  fullWidth
                  required
                >
                  {Durations.map((duration) => (
                    <MenuItem key={duration} value={duration}>
                      {duration} {duration === 1 ? 'hour' : 'hours'}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="type"
                  name="type"
                  label="Type"
                  variant="outlined"
                  value={values.type}
                  onChange={handleChange}
                  error={showError('type')}
                  helperText={errorText('type')}
                  select
                  fullWidth
                  required
                >
                  {Object.keys(Types).map((key) => (
                    <MenuItem key={key} value={key}>
                      {Types[key][culture]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  id="reason"
                  options={Reasons.map((r) => r[culture]).sort()}
                  value={values.reason}
                  onChange={handleReasonChange}
                  freeSolo
                  openOnFocus
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="reason"
                      label="Reason"
                      variant="outlined"
                      onChange={handleChange}
                      error={showError('reason')}
                      helperText={errorText('reason')}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="includeVehicle"
                  name="includeVehicle"
                  label="Vehicle"
                  variant="outlined"
                  value={values.includeVehicle}
                  onChange={handleIncludeVehicleChange}
                  error={showError('includeVehicle')}
                  helperText={errorText('includeVehicle')}
                  select
                  fullWidth
                  required
                >
                  <MenuItem value={false}>Without vehicle</MenuItem>
                  <MenuItem value={true}>With vehicle</MenuItem>
                </TextField>
              </Grid>
              {values.includeVehicle && (
                <Grid item xs={12} md={6}>
                  <TextField
                    id="selfDriven"
                    name="selfDriven"
                    label="Self driven"
                    variant="outlined"
                    value={values.selfDriven}
                    onChange={handleSelfDrivenChange}
                    error={showError('selfDriven')}
                    helperText={errorText('selfDriven')}
                    select
                    fullWidth
                    required
                  >
                    <MenuItem value={false}>No</MenuItem>
                    <MenuItem value={true}>Yes</MenuItem>
                  </TextField>
                </Grid>
              )}
              {values.includeVehicle && (
                <Grid item xs={12} md={values.selfDriven ? 6 : 4}>
                  <TextField
                    id="vehicleNo"
                    name="vehicleNo"
                    label="Vehicle no"
                    variant="outlined"
                    value={values.vehicleNo}
                    onChange={handleChange}
                    error={showError('vehicleNo')}
                    helperText={errorText('vehicleNo')}
                    inputProps={{ maxLength: 64 }}
                    fullWidth
                    required
                  />
                </Grid>
              )}
              {values.includeVehicle && !values.selfDriven && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      id="driverName"
                      name="driverName"
                      label="Driver name"
                      variant="outlined"
                      value={values.driverName}
                      onChange={handleChange}
                      error={showError('driverName')}
                      helperText={errorText('driverName')}
                      inputProps={{ maxLength: 64 }}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      id="driverLicenseNo"
                      name="driverLicenseNo"
                      label="Driver license no"
                      variant="outlined"
                      value={values.driverLicenseNo}
                      onChange={handleChange}
                      error={showError('driverLicenseNo')}
                      helperText={errorText('driverLicenseNo')}
                      inputProps={{ maxLength: 64 }}
                      fullWidth
                      required
                    />
                  </Grid>
                </>
              )}
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={working}
                  fullWidth
                >
                  Submit
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Link to="/">
                  <Button type="button" fullWidth>
                    Cancel
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </form>
        </MuiPickersUtilsProvider>
      </CardContent>
    </Card>
  );
}

export default Apply;
