import React from "react";
import {
  AppBar,
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  Grid,
  Grow,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  withStyles
} from "@material-ui/core";
import { Add, Delete, FileCopy } from "@material-ui/icons";
import "./index.css";
import computeDescriptors from "./compute";
import classNames from "classnames";
import { loadCSS } from "fg-loadcss/src/loadCSS";

const styles = theme => ({
  grow: {
    flexGrow: 1
  },
  layout: {
    flexGrow: 1,
    width: "auto",
    display: "block", // Fix IE11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
      width: "80%",
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  paper: {
    marginTop: theme.spacing.unit * 4,
    marginBottom: theme.spacing.unit * 4,
    paddingBottom: theme.spacing.unit * 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  extendedFab: {
    marginLeft: theme.spacing.unit
  },
  topFab: {
    margin: theme.spacing.unit
  },
  paddedTitle: {
    marginBottom: theme.spacing.unit * 2
  },
  center: {
    textAlign: "center",
    alignItems: "center"
  },
  footer: {
    marginTop: theme.spacing.unit * 4,
    marginBottom: theme.spacing.unit
  },
  icon: {
    verticalAlign: "middle",
    marginRight: theme.spacing.unit
  },
  link: {
    textDecoration: "none",
    color: theme.palette.primary.light,
    cursor: "pointer"
  },
  separator: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  }
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.classes = props.classes;
    this.media = {
      water: {
        eg: {
          header: [
            "Your entering group(s) (EGs)",
            ["NH", <sub>3</sub>],
            ["C", <sub>6</sub>, "H", <sub>5</sub>, <sup>-</sup>]
          ],
          weights: [
            [
              // NH3
              0.002940681329391,
              0.058578322917376
            ],
            [
              // C6H5-
              0.001203686874699,
              -0.019037736629381
            ],
            [
              // independent term
              -0.00547565486918,
              -0.277843714718564
            ]
          ]
        },
        lg: {
          header: [
            "Your leaving group(s) (LGs)",
            ["Br", <sup>-</sup>],
            ["CH", <sub>3</sub>, "COO", <sup>-</sup>]
          ],
          weights: [
            [
              // Br-
              0.003099694614257,
              -0.043441672419052
            ],
            [
              // CH3COO-
              0.001175115146972,
              0.034138546931647
            ],
            [
              // independent term
              0.013849523285139,
              0.099182869251101
            ]
          ]
        }
      },
      dichloromethane: {
        eg: {
          header: [
            "Your entering group(s) (EGs)",
            ["I", <sup>-</sup>],
            ["PH", <sub>2</sub>, <sup>-</sup>]
          ],
          // obtained from ESI table S24
          weights: [
            [
              // I-
              -0.0000271644918594459,
              0.032504124020142
            ],
            [
              // PH2-
              0.004250818307918,
              0.002072293709953
            ],
            [
              // independent term
              -0.013118103548058,
              -0.517878018096381
            ]
          ]
        },
        lg: {
          header: [
            "Your leaving group(s) (LGs)",
            ["HC(=O)OO", <sup>-</sup>],
            ["TfO", <sup>-</sup>]
          ],
          weights: [
            [
              // HC(=O)OO-
              0.003413657093867,
              -0.030788356417852
            ],
            [
              // TfO-
              0.001327440746793,
              0.017629923597061
            ],
            [
              // independent term
              -0.008313861683811,
              0.118566168567736,
            ]
          ]
        }
      }
    };
    this._defaultMedium = "water";
    this._defaultCompoundType = "eg";
    const _length = this.media[this._defaultMedium][this._defaultCompoundType]
      .header.length;
    this.state = {
      medium: this._defaultMedium,
      compoundType: this._defaultCompoundType,
      rows: [Array(_length).fill("")],
      infoDialog: false
    };
  }
  filledRows() {
    let rowsOK = [];
    for (let i = 0; i < this.state.rows.length; i++) {
      let row = this.state.rows[i];
      let OK = true;
      for (let j = 0; j < row.length; j++) {
        let cell = row[j];
        if ((j && !this.validateQuantity(cell)) || !this.validateName(cell)) {
          OK = false;
          break;
        }
      }
      if (OK) {
        rowsOK.push(i);
      }
    }
    return rowsOK;
  }
  validateQuantity(value) {
    return (
      this.validateName(value) && !isNaN(parseFloat(value)) && isFinite(value)
    );
  }
  validateName(value) {
    return value !== undefined && value !== null && value.length > 0;
  }
  handleAddRow() {
    let rows = this.state.rows.slice();
    rows.push(
      Array(
        this.media[this.state.medium][this.state.compoundType].header.length
      ).fill("")
    );
    this.setState({
      rows: rows
    });
  }
  handleRemoveRow(i) {
    const rows = this.state.rows;
    const newRows = rows.slice(0, i).concat(rows.slice(i + 1));
    this.setState({
      rows: newRows
    });
  }
  handleMediumChange(medium) {
    let rows = [
      Array(this.media[medium][this.state.compoundType].header.length).fill("")
    ];
    this.setState({
      medium: medium,
      rows: rows
    });
  }
  handleCompoundTypeChange(compoundType) {
    let rows = [
      Array(this.media[this.state.medium][compoundType].header.length).fill("")
    ];
    this.setState({
      compoundType: compoundType,
      rows: rows
    });
  }
  handleFieldInput(event) {
    let target = event.target;
    let rows = this.state.rows.slice();
    rows[target.dataset.x][target.dataset.y] = target.value;
    this.setState({
      rows: rows
    });
  }
  handleInfoDialog(event) {
    this.setState({
      infoDialog: !this.state.infoDialog
    });
  }
  render() {
    const classes = this.classes;
    const header = this.media[this.state.medium][this.state.compoundType]
      .header;
    const rows = this.state.rows.slice();

    let tableHeaders = [
      <TableCell key={0}>
        <Tooltip title="Add new row">
          <IconButton
            color="primary"
            onClick={() => this.handleAddRow()}
            aria-label="Add row"
          >
            <Add />
          </IconButton>
        </Tooltip>
      </TableCell>
    ];
    header.forEach((h, n) => {
      tableHeaders.push(<TableCell key={n + 1}>{h}</TableCell>);
    });

    let tableRows = [];
    rows.forEach((row, i) => {
      let tableCells = [
        <TableCell key={0}>
          <Tooltip title="Delete row">
            <IconButton
              onClick={() => this.handleRemoveRow(i)}
              aria-label="Delete row"
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </TableCell>
      ];
      row.forEach((cell, j) => {
        let xy = { "data-x": i, "data-y": j };
        let errorState = j
          ? !this.validateQuantity(rows[i][j])
          : !this.validateName(rows[i][j]);
        let tooltip = j
          ? "Activation energy (in kcal/mol)"
          : "Nucleophile name";
        tableCells.push(
          <TableCell key={j + 1}>
            <Tooltip title={tooltip}>
              <TextField
                inputProps={xy}
                onChange={e => this.handleFieldInput(e)}
                value={cell}
                error={errorState}
              />
            </Tooltip>
          </TableCell>
        );
      });
      tableRows.push(<TableRow key={i}>{tableCells}</TableRow>);
    });

    let resultCards = [];
    const rowsOK = this.filledRows();
    rowsOK.forEach((row, i) => {
      const name = this.state.rows[row][0];
      const energies = this.state.rows[row].slice(1);
      const medium = this.state.medium;
      const compoundType = this.state.compoundType;
      const weights = this.media[medium][compoundType].weights;
      const descriptors = computeDescriptors(energies, weights);
      resultCards.push(
        <Grid item xs={3} key={i}>
          <ResultCard
            classes={classes}
            name={name}
            medium={medium}
            compoundType={compoundType}
            descriptors={descriptors}
            style={null}
          />
        </Grid>
      );
    });
    let resultsGrid;
    if (resultCards.length) {
      resultsGrid = (
        <Grid container spacing={8}>
          {resultCards}
        </Grid>
      );
    }
    return (
      <div className={classes.layout}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h4" color="inherit" className={classes.grow}>
              SN2 Matrix App
            </Typography>
            <ConditionsMenu
              items={["EG", "LG"]}
              labelName={"Nucleophile Type"}
              onValueChange={e => this.handleCompoundTypeChange(e)}
              defaultValue={this.state.compoundType}
            />
            <ConditionsMenu
              items={["Dichloromethane", "Water"]}
              labelName={"Medium"}
              onValueChange={e => this.handleMediumChange(e)}
              defaultValue={this.state.medium}
            />
          </Toolbar>
        </AppBar>
        <Paper className={classes.paper}>
          <Table padding="dense" key={header.length}>
            <TableHead>
              <TableRow>{tableHeaders}</TableRow>
            </TableHead>
            <TableBody>{tableRows}</TableBody>
          </Table>
        </Paper>
        {resultsGrid}
        <Footer
          classes={classes}
          handleInfoDialog={e => this.handleInfoDialog(e)}
        />
        <InfoDialog
          open={this.state.infoDialog}
          onClose={e => this.handleInfoDialog(e)}
        />
      </div>
    );
  }
}

function ResultCard(props) {
  const { classes, name, descriptors, medium, compoundType } = props;
  let compoundTypeTitle =
    compoundType.charAt(0).toUpperCase() + compoundType.slice(1);
  let lis = [];
  for (let i = 0; i < descriptors.length-1; i++) {
    const descriptor = <code>{descriptors[i]}</code>;
    lis.push(
      <ListItem key={i} disableGutters>
        <ListItemText primary={descriptor} />
      </ListItem>
    );
  }
  return (
    <Card>
      <CardHeader
        avatar={
          <Tooltip title={compoundTypeTitle}>
            <Avatar aria-label={compoundType}>
              {compoundTypeTitle.charAt(0)}
            </Avatar>
          </Tooltip>
        }
        action={
          <Tooltip title="Copy">
            <IconButton
              onClick={() => {
                window.prompt("Press Ctrl+C (or Cmd+C)", descriptors[0]); // .join(","));
              }}
            >
              <FileCopy />
            </IconButton>
          </Tooltip>
        }
        title={name}
        // subheader={compoundTypeTitle}
      />
      <CardContent>
        <Typography color="textSecondary">Hidden descriptor for {medium}</Typography>
        <List>{lis}</List>
      </CardContent>
      <CardActions />
    </Card>
  );
}

class ConditionsMenu extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.labelName = props.labelName;
    this.state = {
      anchorEl: null,
      selected: props.defaultValue,
      items: props.items
    };
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleValueChange = event => {
    let value = event.target.innerText.toLowerCase();
    this.props.onValueChange(value);
    this.handleClose();
    this.setState({
      selected: value
    });
  };

  render() {
    const { anchorEl, items } = this.state;
    let menuItems = [];
    items.forEach((item, i) => {
      menuItems.push(
        <MenuItem key={i} onClick={e => this.handleValueChange(e)}>
          {item}
        </MenuItem>
      );
    });
    return (
      <div>
        <Button
          aria-owns={anchorEl ? "simple-menu" : null}
          aria-haspopup="true"
          color="inherit"
          onClick={this.handleClick}
        >
          {this.labelName}: {this.state.selected}
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {menuItems}
        </Menu>
      </div>
    );
  }
}

function SeparatorDot(props) {
  return <span className={props.className}>&middot;</span>;
}

function Footer(props) {
  loadCSS(
    "https://use.fontawesome.com/releases/v5.1.0/css/all.css",
    document.querySelector("#insertion-point-jss")
  );
  return (
    <div
      id="footer"
      className={classNames(props.classes.center, props.classes.footer)}
    >
      <Typography variant="caption" align="left" display="block" gutterBottom>
        Computational Details:
        <ul>
          <li>
            Electronic structure calculations: Gaussian 16.
          </li>
          <li>
            Medium water: Optimizations in water were computed 
            using SMD with B3LYP-D3/6-311+G(d) for H-Cl elements, B3LYP-D3/LANL2DZdp
            for I and Br elements, and  B3LYP-D3/SDD together with Stuttgart/Dresden 
            ECP for heavier atoms. All energies in kcal·mol<sup>-1</sup>, 
            corresponding to energy barrier of the reaction.
          </li>
          <li>
            Medium dichloromethane: Optimizations in dichloromethane were computed 
            using SMD with B3LYP-D3/6-311+G(d) for H-Cl elements, B3LYP-D3/LANL2DZdp
            for I and Br elements, and  B3LYP-D3/SDD together with Stuttgart/Dresden 
            ECP for heavier atoms. All energies in kcal·mol<sup>-1</sup>, 
            corresponding to energy barrier of the reaction.
          </li>
        </ul>
      </Typography>
      <Typography variant="caption" align="left" display="block" gutterBottom>
        Reference Articles:
        <ul>
          <li>
            L. Morán-González, M. Besora, F. Maseras, J. Org. Chem. 2022, 87, 1, 363-372. DOI:
            <a
              href="https://pubs.acs.org/doi/10.1021/acs.joc.1c02387"
              target="_blank"
              rel="noopener noreferrer"
              className={props.classes.link}
            >
            10.1021/acs.joc.1c02387
            </a>            
          </li>
        </ul>
      </Typography>
      <Typography variant="body2">
        SN2 Matrix App
        <SeparatorDot className={props.classes.separator} />
        <span onClick={props.handleInfoDialog} className={props.classes.link}>
          <Icon className={classNames(props.classes.icon, "fa fa-info")} />
          More info
        </span>
        <SeparatorDot className={props.classes.separator} />
        <a
          href="https://pubs.acs.org/doi/10.1021/acs.joc.1c02387"
          target="_blank"
          rel="noopener noreferrer"
          className={props.classes.link}
        >
          <Icon className={classNames(props.classes.icon, "fa fa-book")} />
          Citation
        </a>
        <SeparatorDot className={props.classes.separator} />
        <a
          href="https://github.com/maserasgroup-repo"
          target="_blank"
          rel="noopener noreferrer"
          className={props.classes.link}
        >
          <Icon className={classNames(props.classes.icon, "fab fa-github")} />
          @maserasgroup-repo
        </a>
        <SeparatorDot className={props.classes.separator} />
        <a
          href="https://github.com/lmoranglez"
          target="_blank"
          rel="noopener noreferrer"
          className={props.classes.link}
        >
          <Icon className={classNames(props.classes.icon, "fab fa-github")} />
          @lmoranglez
        </a>
      </Typography>
    </div>
  );
}

function InfoDialog(props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      scroll="paper"
      aria-labelledby="scroll-dialog-title"
    >
      <DialogTitle id="scroll-dialog-title">
        About the SN2 Matrix App
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
        Bimolecular nucleophilic substitution is one of the fundamental reactions in organic chemistry, yet there is still knowledge to be gained on the role of the nucleophile and the substrate. A statistical treatment of over 600 density functional theory (DFT)-computed barriers for bimolecular nucleophilic substitution at methyl derivatives (SN2@C) leads to the identification of numerical descriptors that best represent the entering and leaving ability of 26 different nucleophiles. The treatment is based on singular value decomposition (SVD) of a matrix of computed energy barriers. The current work represents the extension to a problem of reactivity of the hidden descriptor methodology that we had previously developed for the thermodynamic problem of bond dissociation energies in transition-metal complexes. The analysis of the results shows that a single descriptor is sufficient. This hidden descriptor has different values for nucleophilic and leaving abilities and, contrary to expectation, does not correlate especially well with either frontier molecular orbital descriptors or solvation descriptors. In contrast, it correlates with other thermodynamic and geometric parameters. This statistical procedure can be in principle extended to additional chemical fragments and other reactions. <a href="https://pubs.acs.org/doi/10.1021/acs.joc.1c02387" target="_blank">Read the article</a>.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const StyledApp = withStyles(styles)(App);
export default StyledApp;
