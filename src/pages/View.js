import dayjs from 'dayjs';

import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import QRCode from 'qrcode.react';

import IDTypes from '../data/id-types';
import Types from '../data/types';
import Districts from '../data/locations.json';

import Api from '../api';

import { LocalizationContext } from '../contexts/localization';
import Spinner from '../components/Spinner';

const Styles = makeStyles((theme) => ({
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing(3)
  },
  avatar: {
    width: theme.spacing(24),
    height: theme.spacing(24)
  }
}));

function View() {
  const styles = Styles();

  const [loading, setLoading] = useState(true);
  const [pass, setPass] = useState(null);
  const qrContainer = useRef();
  const culture = useContext(LocalizationContext);
  const { id } = useParams();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const local = await Api.getPass(id);
      setPass(local);
      setLoading(false);
    })();
  }, [id]);

  const applicantAge = () =>
    pass ? dayjs().diff(dayjs(pass.applicant.dateOfBirth), 'years') : null;

  const idTypeName = () =>
    pass ? IDTypes[pass.applicant.idType][culture] : null;

  const passDuration = () =>
    pass ? dayjs(pass.endAt).diff(pass.startAt, 'hours') : null;

  const districtName = (district) => {
    const match = Districts.find((d) => d.id === district);

    return match[culture];
  };

  const thanaName = (district, thana) => {
    const match = Districts.find((d) => d.id === district).thanas.find(
      (t) => t.id === thana
    );

    return match[culture];
  };

  const typeName = () => (pass ? Types[pass.type][culture] : null);

  const downloadQRCode = () => {
    if (!qrContainer.current) {
      return;
    }

    const canvas = qrContainer.current.querySelector('canvas');
    const image = canvas.toDataURL('image/jpg');
    const anchor = document.createElement('a');

    anchor.href = image;
    anchor.download = `movement-pass_${pass.id}.jpg`;
    document.body.appendChild(anchor);
    anchor.click();

    document.body.removeChild(anchor);
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" className={styles.title}>
            Movement Pass
          </Typography>
          {loading ? (
            <Spinner />
          ) : (
            <Grid container spacing={3}>
              <Grid
                item
                container
                xs={12}
                md={6}
                spacing={1}
                direction="column"
                alignItems="center"
              >
                <Grid item>
                  <Avatar
                    src={pass.applicant.photo}
                    className={styles.avatar}
                  />
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    component="span"
                    color="textSecondary"
                  >
                    Name:
                  </Typography>{' '}
                  <Typography variant="body1" component="span">
                    {pass.applicant.name}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    component="span"
                    color="textSecondary"
                  >
                    Age:
                  </Typography>{' '}
                  <Typography variant="body1" component="span">
                    {applicantAge()} years
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    component="span"
                    color="textSecondary"
                  >
                    ID Number:
                  </Typography>{' '}
                  <Typography variant="body1" component="span">
                    {pass.applicant.idNumber} ({idTypeName()})
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    component="span"
                    color="textSecondary"
                  >
                    Mobile Phone:
                  </Typography>{' '}
                  <Typography variant="body1" component="span">
                    {pass.applicant.id}
                  </Typography>
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={12}
                md={6}
                spacing={1}
                direction="column"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="body1" component="span">
                    You took movement Pass {pass.applicant.approvedCount} times
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    component="span"
                    color="textSecondary"
                  >
                    Reason for Pass
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1" component="span">
                    {pass.reason}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    component="span"
                    color="textSecondary"
                  >
                    Time allowed for movement
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1" component="span">
                    {passDuration()} hours
                  </Typography>
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={12}
                spacing={1}
                direction="column"
                alignItems="center"
              >
                <Grid item>
                  <Typography
                    variant="body2"
                    component="span"
                    color="textSecondary"
                  >
                    Date and Time
                  </Typography>
                </Grid>
                <Grid item>
                  {dayjs(pass.startAt).format('MMMM D, h:mm a')} -{' '}
                  {dayjs(pass.endAt).format('MMMM D, h:mm a')}
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={12}
                md={pass.includeVehicle ? 6 : 12}
                spacing={1}
                direction="column"
                alignItems="center"
              >
                <Grid item>
                  <Typography
                    variant="body2"
                    component="span"
                    color="textSecondary"
                  >
                    From
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1" component="span">
                    {pass.fromLocation} (
                    {thanaName(pass.applicant.district, pass.applicant.thana)},{' '}
                    {districtName(pass.applicant.district)})
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    component="span"
                    color="textSecondary"
                  >
                    To
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1" component="span">
                    {pass.toLocation} ({thanaName(pass.district, pass.thana)},{' '}
                    {districtName(pass.district)})
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1" component="span">
                    ({typeName()})
                  </Typography>
                </Grid>
              </Grid>
              {pass.includeVehicle && (
                <Grid
                  item
                  container
                  xs={12}
                  md={6}
                  spacing={1}
                  direction="column"
                  alignItems="center"
                >
                  <Grid item>
                    <Typography
                      variant="body2"
                      component="span"
                      color="textSecondary"
                    >
                      Vehicle No:
                    </Typography>{' '}
                    <Typography variant="body1" component="span">
                      {pass.vehicleNo}
                    </Typography>
                  </Grid>
                  {!pass.selfDriven && (
                    <>
                      <Grid item>
                        <Typography
                          variant="body2"
                          component="span"
                          color="textSecondary"
                        >
                          Driver Name:
                        </Typography>{' '}
                        <Typography variant="body1" component="span">
                          {pass.driverName}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography
                          variant="body2"
                          component="span"
                          color="textSecondary"
                        >
                          Driver License No:
                        </Typography>{' '}
                        <Typography variant="body1" component="span">
                          {pass.driverLicenseNo}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              )}
              <Grid
                item
                container
                xs={12}
                spacing={1}
                direction="column"
                alignItems="center"
              >
                <Grid item>
                  <Typography
                    variant="body2"
                    component="span"
                    color="textSecondary"
                  >
                    Tracking No
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body1" component="span">
                    {pass.id}
                  </Typography>
                </Grid>
                <Grid item ref={qrContainer}>
                  <QRCode value={JSON.stringify(pass)} size={256} />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={downloadQRCode}
                  >
                    Download QRCode
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default View;
